import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { EmojiProvider } from "react-apple-emojis"
import emojiData from "react-apple-emojis/src/data.json"

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <EmojiProvider data={emojiData}>
      <App />
    </EmojiProvider>
  </StrictMode>,
)
