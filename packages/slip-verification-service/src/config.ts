export interface Config {
  port: string;
  slip2goApiUrl: string;
  slip2goSecret: string;
  internalSecret: string;
}

function getEnv(key: string, fallback: string): string {
  const value = process.env[key];
  return value && value !== '' ? value : fallback;
}

export function loadConfig(): Config {
  return {
    port: getEnv('PORT', '8090'),
    slip2goApiUrl: getEnv('SLIP2GO_API_URL', 'https://connect.slip2go.com'),
    slip2goSecret: getEnv('SLIP_2GO_SECRET', ''),
    internalSecret: getEnv('INTERNAL_SECRET', ''),
  };
}
