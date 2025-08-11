
// src/config/app-config.ts
interface IAppConfig {
  apiBaseUrl: string;
  socketUrl: string;
}

export const AppConfig: IAppConfig = {
  apiBaseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9005/api',
  socketUrl: process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:9005'
};