/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly DEV: boolean;
  readonly PROD: boolean;
  readonly MODE: string;
  readonly BASE_URL: string;
  // 如果你有其他自定义环境变量，可以在这里定义
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
