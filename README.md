# Ohana Store

Ohana Store es una aplicacion de escritorio construida con Electron, Rails y React.

La app empaqueta:

- una shell nativa con Electron
- un backend Rails ejecutado localmente
- una interfaz React servida dentro de la ventana de escritorio
- almacenamiento de datos y archivos en el equipo del usuario

## Requisitos

- `Ruby 3.2.3`
- `Node.js 20+`
- `Yarn 1.22.x`
- `Bundler`

## Instalacion

Instala dependencias de Ruby:

```bash
bundle install
```

Instala dependencias de Node:

```bash
yarn install
yarn --cwd frontend install
```

## Desarrollo

Para trabajar con la app en modo desktop:

1. Arranca el frontend en modo desarrollo:

```bash
yarn frontend:dev:desktop
```

2. En otra terminal, abre Electron:

```bash
yarn desktop:dev
```

En este modo:

- Rails se ejecuta en entorno `desktop`
- Electron arranca el backend localmente
- el frontend se sirve en desarrollo desde `http://127.0.0.1:3002`

## Comandos desktop

- `yarn desktop:prepare-runtime`: prepara el runtime Ruby embebido en `tmp/desktop-runtime`
- `yarn desktop:dev`: abre la app con Electron en modo desarrollo
- `yarn desktop:build`: genera el frontend desktop y prepara el runtime Ruby
- `yarn desktop:dist`: crea una build empaquetada usando la configuracion general de `electron-builder`
- `yarn desktop:dist:dir`: crea el bundle desempaquetado para pruebas locales
- `yarn desktop:dist:dir:mac:arm64`: crea un bundle desempaquetado para macOS Apple Silicon
- `yarn desktop:dist:dir:mac:x64`: crea un bundle desempaquetado para macOS Intel
- `yarn desktop:dist:mac:arm64`: crea una build empaquetada para macOS Apple Silicon
- `yarn desktop:dist:mac:x64`: crea una build empaquetada para macOS Intel

## Build desktop

Prepara el frontend y el runtime Ruby:

```bash
yarn desktop:build
```

Genera una build empaquetada:

```bash
yarn desktop:dist
```

Si solo quieres el bundle desempaquetado para probarlo localmente:

```bash
yarn desktop:dist:dir
```

Builds especificas de macOS:

```bash
yarn desktop:dist:dir:mac:arm64
yarn desktop:dist:dir:mac:x64
yarn desktop:dist:mac:arm64
yarn desktop:dist:mac:x64
```

## Runtime local

La build desktop prepara un runtime Ruby a partir del Ruby instalado en la maquina y lo copia a `tmp/desktop-runtime`.

Si cambias de version de Ruby o de maquina, conviene regenerarlo:

```bash
yarn desktop:prepare-runtime
```

## macOS

La build de macOS puede funcionar en dos modos:

- con firma real y notarizacion, si defines credenciales de Apple
- con firma `ad-hoc` local para pruebas en tu propio equipo

Variables soportadas para firma y notarizacion:

- `CSC_NAME` o `APPLE_SIGN_IDENTITY`
- `APPLE_ID`
- `APPLE_APP_SPECIFIC_PASSWORD`
- `APPLE_TEAM_ID`

Arquitecturas soportadas:

- `arm64` para Macs con Apple Silicon
- `x64` para Macs Intel

La arquitectura de la build debe coincidir con la del Mac donde se va a ejecutar.

Importante: el runtime Ruby embebido tambien queda ligado a la arquitectura con la que se prepara. Lo mas fiable es generar la build `arm64` en un Mac Apple Silicon y la build `x64` en un Mac Intel, o al menos con un Ruby de esa misma arquitectura.

Para probar la app en otro Mac sin distribuirla oficialmente:

```bash
yarn desktop:dist:dir:mac:arm64
```

Luego copia:

`dist/mac-arm64/Ohana Store.app`

Si el Mac destino es Intel, genera y copia la variante `x64`.

En algunos equipos puede hacer falta abrirla con clic derecho -> `Abrir` o permitirla desde `Privacy & Security`.

## Estructura

- `electron/`: proceso principal, `preload` y recursos de la app
- `frontend/`: interfaz React
- `app/`, `config/`, `db/`: backend Rails
- `scripts/desktop/`: utilidades de empaquetado y firma

## Datos locales

La aplicacion guarda su base de datos y archivos de trabajo en directorios locales del usuario cuando se ejecuta en modo desktop.
