const getDesktopApiBaseUrl = () => {
  if (typeof window === 'undefined') {
    return null;
  }

  const desktopConfig = (window as Window & {
    desktopConfig?: {
      apiBaseUrl?: string;
    };
  }).desktopConfig;

  return desktopConfig?.apiBaseUrl || null;
};

export const getApiBaseUrl = () => {
  return (
    getDesktopApiBaseUrl() ||
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    'http://127.0.0.1:3000'
  );
};
