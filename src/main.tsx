import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App.tsx';
import './styles/fontes.ts';
import './styles/reset.css';
import './styles/tokens.css';
import './styles/temas.css';
import './styles/global.css';

const raiz = createRoot(document.getElementById('root')!);

if (window.location.pathname === '/og') {
  // Cartão da prévia do link (scripts/og.ts). Chunk à parte: o visitante comum nunca baixa isto.
  void import('./og/PaginaOg.tsx').then(({ default: PaginaOg }) => {
    document.documentElement.dataset.intro = 'done';
    raiz.render(<PaginaOg />);
  });
} else {
  raiz.render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}
