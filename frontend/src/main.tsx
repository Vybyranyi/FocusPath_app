import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { EmojiProvider } from "react-apple-emojis";
import emojiData from "react-apple-emojis/src/data.json";
import { Provider } from 'react-redux';
import { store } from '@store/store.ts';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <EmojiProvider data={emojiData}>
        <App />
      </EmojiProvider>
    </Provider>
  </StrictMode>,
)
