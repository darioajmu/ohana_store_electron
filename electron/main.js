const { app, BrowserWindow } = require('electron');
const http = require('http');
const path = require('path');
const fs = require('fs');
const net = require('net');
const os = require('os');
const { spawn, spawnSync } = require('child_process');

const isDev = !app.isPackaged;
let backendPort = Number(process.env.OHANA_API_PORT || 3130);
let frontendPort = Number(process.env.OHANA_DESKTOP_FRONTEND_PORT || 3002);
let backendUrl = `http://127.0.0.1:${backendPort}`;

let backendProcess = null;
let staticServer = null;
const desktopLogPath = path.join(os.tmpdir(), 'ohana-store-desktop.log');

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const logDesktop = (message, details) => {
  const timestamp = new Date().toISOString();
  const suffix = details === undefined ? '' : ` ${typeof details === 'string' ? details : JSON.stringify(details)}`;
  const line = `[${timestamp}] ${message}${suffix}\n`;

  try {
    fs.appendFileSync(desktopLogPath, line);
  } catch (error) {
    console.error('Could not write desktop log', error);
  }

  console.log(line.trim());
};

const getResourcePath = (...segments) => {
  if (app.isPackaged) {
    return path.join(process.resourcesPath, ...segments);
  }

  return path.join(app.getAppPath(), ...segments);
};

const getBackendRoot = () => {
  if (app.isPackaged) {
    return getResourcePath('app-backend');
  }

  return app.getAppPath();
};

const getRubyRuntimeMetadata = () => {
  const metadataPath = getResourcePath('ruby-runtime-metadata.json');

  if (!app.isPackaged || !fs.existsSync(metadataPath)) {
    return null;
  }

  return JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
};

const getPackagedRubyEnvironment = (backendRoot) => {
  const metadata = getRubyRuntimeMetadata();

  if (!metadata) {
    throw new Error('Packaged Ruby runtime metadata is missing');
  }

  const rubyRuntimeRoot = getResourcePath('ruby-runtime');
  const rubyBinPath = path.join(process.resourcesPath, metadata.rubyBin);
  const gemHomePath = path.join(process.resourcesPath, metadata.gemHome);

  if (!fs.existsSync(rubyBinPath)) {
    throw new Error(`Packaged Ruby binary not found at ${rubyBinPath}`);
  }

  return {
    command: rubyBinPath,
    env: {
      BUNDLE_DISABLE_SHARED_GEMS: 'true',
      BUNDLE_FROZEN: 'true',
      BUNDLE_GEMFILE: path.join(backendRoot, 'Gemfile'),
      BUNDLE_BIN_PATH: '',
      GEM_HOME: gemHomePath,
      GEM_PATH: gemHomePath,
      PATH: `${path.join(rubyRuntimeRoot, 'bin')}:${process.env.PATH || ''}`,
      RUBYOPT: '',
    },
    setupArgs: [path.join(backendRoot, 'bin', 'rails'), 'db:prepare'],
    serverArgs: [path.join(backendRoot, 'bin', 'rails'), 'server', '-e', 'desktop', '-p', String(backendPort), '-b', '127.0.0.1'],
  };
};

const getPreloadPath = () => path.join(app.getAppPath(), 'electron', 'preload.js');

const getAvailablePort = (preferredPort) =>
  new Promise((resolve) => {
    const server = net.createServer();

    server.once('error', () => {
      server.close(() => resolve(getAvailablePort(0)));
    });

    server.once('listening', () => {
      const address = server.address();
      const selectedPort = typeof address === 'object' && address ? address.port : preferredPort;
      server.close(() => resolve(selectedPort));
    });

    server.listen(preferredPort, '127.0.0.1');
  });

const waitForUrl = async (url, attempts = 60) => {
  logDesktop('Waiting for URL', { url, attempts });

  for (let index = 0; index < attempts; index += 1) {
    try {
      await new Promise((resolve, reject) => {
        const request = http.get(url, (response) => {
          response.resume();
          if (response.statusCode && response.statusCode < 500) {
            resolve();
            return;
          }

          reject(new Error(`Unexpected status code: ${response.statusCode}`));
        });

        request.on('error', reject);
      });

      return;
    } catch (error) {
      logDesktop('URL not ready yet', {
        url,
        attempt: index + 1,
        error: error.message,
      });
      await wait(1000);
    }
  }

  throw new Error(`Timed out waiting for ${url}`);
};

const resolveFrontendDist = () => getResourcePath('frontend-out');

const getMimeType = (filePath) => {
  if (filePath.endsWith('.html')) return 'text/html; charset=utf-8';
  if (filePath.endsWith('.js')) return 'application/javascript; charset=utf-8';
  if (filePath.endsWith('.css')) return 'text/css; charset=utf-8';
  if (filePath.endsWith('.json')) return 'application/json; charset=utf-8';
  if (filePath.endsWith('.svg')) return 'image/svg+xml';
  if (filePath.endsWith('.png')) return 'image/png';
  if (filePath.endsWith('.jpg') || filePath.endsWith('.jpeg')) return 'image/jpeg';
  if (filePath.endsWith('.ico')) return 'image/x-icon';

  return 'application/octet-stream';
};

const startStaticFrontendServer = () => {
  const distPath = resolveFrontendDist();
  logDesktop('Starting static frontend server', { distPath, frontendPort });

  staticServer = http.createServer((request, response) => {
    const requestPath = request.url === '/' ? '/index.html' : request.url;
    const safePath = requestPath.split('?')[0];
    let filePath = path.join(distPath, safePath);

    if (safePath.endsWith('/')) {
      filePath = path.join(distPath, safePath, 'index.html');
    }

    if (!path.extname(filePath)) {
      filePath = path.join(distPath, safePath, 'index.html');
    }

    if (!fs.existsSync(filePath)) {
      response.writeHead(404);
      response.end('Not found');
      return;
    }

    response.writeHead(200, {
      'Content-Type': getMimeType(filePath),
    });
    fs.createReadStream(filePath).pipe(response);
  });

  return new Promise((resolve) => {
    staticServer.listen(frontendPort, '127.0.0.1', resolve);
  });
};

const ensureDesktopBackendFolders = (desktopDataPath) => {
  const folders = [
    path.join(desktopDataPath, 'storage'),
    path.join(desktopDataPath, 'tmp'),
    path.join(desktopDataPath, 'tmp', 'pids'),
    path.join(desktopDataPath, 'log'),
  ];

  folders.forEach((folderPath) => {
    fs.mkdirSync(folderPath, { recursive: true });
  });
};

const getBackendCommand = (backendRoot) => {
  if (app.isPackaged) {
    return getPackagedRubyEnvironment(backendRoot);
  }

  return {
    command: process.env.OHANA_DESKTOP_BUNDLE_BIN || 'bundle',
    env: {},
    setupArgs: ['exec', 'rails', 'db:prepare'],
    serverArgs: ['exec', 'rails', 'server', '-e', 'desktop', '-p', String(backendPort), '-b', '127.0.0.1'],
  };
};

const startBackend = async () => {
  const desktopDataPath = path.join(app.getPath('userData'), 'desktop-backend');
  const storagePath = path.join(desktopDataPath, 'storage');
  const databasePath = path.join(desktopDataPath, 'ohana.sqlite3');
  const backendRoot = getBackendRoot();
  const { command, env: runtimeEnv, setupArgs, serverArgs } = getBackendCommand(backendRoot);
  const backendEnv = {
    ...process.env,
    ...runtimeEnv,
    BINDING: '127.0.0.1',
    OHANA_API_HOST: '127.0.0.1',
    OHANA_API_PORT: String(backendPort),
    OHANA_DESKTOP_DB_PATH: databasePath,
    OHANA_DESKTOP_STORAGE_PATH: storagePath,
    OHANA_DESKTOP_DATA_PATH: desktopDataPath,
    RAILS_ENV: 'desktop',
  };

  ensureDesktopBackendFolders(desktopDataPath);
  logDesktop('Preparing backend', {
    backendRoot,
    desktopDataPath,
    databasePath,
    storagePath,
    backendPort,
    packaged: app.isPackaged,
    desktopLogPath,
  });

  const prepareResult = spawnSync(command, setupArgs, {
    cwd: backendRoot,
    env: backendEnv,
    encoding: 'utf8',
  });

  logDesktop('Backend prepare finished', {
    status: prepareResult.status,
    signal: prepareResult.signal,
    stdout: prepareResult.stdout,
    stderr: prepareResult.stderr,
  });

  if (prepareResult.status !== 0) {
    throw new Error('Could not prepare the desktop database');
  }

  backendProcess = spawn(command, serverArgs, {
    cwd: backendRoot,
    env: backendEnv,
    stdio: app.isPackaged ? ['ignore', 'pipe', 'pipe'] : 'inherit',
  });

  if (app.isPackaged) {
    backendProcess.stdout.on('data', (chunk) => {
      logDesktop('Backend stdout', chunk.toString());
    });

    backendProcess.stderr.on('data', (chunk) => {
      logDesktop('Backend stderr', chunk.toString());
    });
  }

  backendProcess.on('error', (error) => {
    logDesktop('Backend process error', error.message);
  });

  backendProcess.on('exit', (code) => {
    logDesktop('Backend process exited', { code });
    if (code !== 0) {
      console.error(`Rails backend exited with code ${code}`);
    }
  });

  await waitForUrl(`${backendUrl}/up`);
};

const createWindow = async () => {
  logDesktop('Creating Electron window');
  backendPort = await getAvailablePort(backendPort);
  backendUrl = `http://127.0.0.1:${backendPort}`;

  if (!isDev) {
    frontendPort = await getAvailablePort(frontendPort);
  }

  process.env.OHANA_API_BASE_URL = backendUrl;
  logDesktop('Resolved runtime ports', { backendPort, frontendPort, backendUrl, isDev });

  await startBackend();

  if (!isDev) {
    await startStaticFrontendServer();
  } else {
    await waitForUrl(`http://127.0.0.1:${frontendPort}`, 120);
  }

  const window = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1100,
    minHeight: 760,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      preload: getPreloadPath(),
    },
  });

  const frontendUrl = `http://127.0.0.1:${frontendPort}`;
  logDesktop('Loading frontend URL', { frontendUrl });
  await window.loadURL(frontendUrl);

  if (isDev) {
    window.webContents.openDevTools({ mode: 'detach' });
  }
};

process.on('uncaughtException', (error) => {
  logDesktop('Uncaught exception', {
    message: error.message,
    stack: error.stack,
  });
});

process.on('unhandledRejection', (reason) => {
  logDesktop('Unhandled rejection', String(reason));
});

app.whenReady().then(createWindow).catch((error) => {
  logDesktop('App startup failed', {
    message: error.message,
    stack: error.stack,
  });
  console.error(error);
  app.quit();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', () => {
  if (staticServer) {
    staticServer.close();
  }

  if (backendProcess) {
    backendProcess.kill('SIGTERM');
  }
});
