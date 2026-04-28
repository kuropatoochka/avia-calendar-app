import { createRoot } from 'react-dom/client';
import { App } from './App';

async function enableMocking() {
  if (import.meta.env.VITE_MOCK_ENABLED === 'true') {
    const { worker } = await import('./msw/browser');

    return worker.start();
  }

  return Promise.resolve();
}

const container = document.getElementById('root');

if (!container) {
  throw new Error('Root element not found');
}

enableMocking().then(() => {
  createRoot(container).render(<App />);
});
