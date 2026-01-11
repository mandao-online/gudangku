// Version utility to get app version and build info
export const getAppVersion = () => {
  // Get version from package.json (will be injected during build)
  const version = import.meta.env.VITE_APP_VERSION || '1.0.0';
  
  // Get build timestamp (will be injected during build)
  const buildTime = import.meta.env.VITE_BUILD_TIME || new Date().toISOString();
  
  return {
    version,
    buildTime: new Date(buildTime),
    buildId: buildTime.slice(-8) // Last 8 chars as build ID
  };
};

export const formatBuildTime = (buildTime: Date) => {
  return buildTime.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};