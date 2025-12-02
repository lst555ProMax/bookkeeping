import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.scss'
import App from './App.tsx'
import { checkAndPromptSampleData } from './utils/common/sampleData'

// 检查并提示导入示例数据
checkAndPromptSampleData().catch(console.error);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)