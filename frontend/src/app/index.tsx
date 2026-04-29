import { createRoot } from 'react-dom/client';
import { DATA_SOURCE } from '@/shared/consts';
import { App } from './App';

async function enableMocking() {
  if (DATA_SOURCE !== 'mock') {
    return;
  }

  const { worker } = await import('./msw/browser');

  await worker.start({
    onUnhandledRequest: 'bypass',
  });
}

const container = document.getElementById('root');

if (!container) {
  throw new Error('Root element not found');
}

enableMocking().then(() => {
  createRoot(container).render(<App />);
});
