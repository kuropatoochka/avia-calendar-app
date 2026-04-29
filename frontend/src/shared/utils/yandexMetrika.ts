type YandexMetrikaParams = Record<string, string | number | boolean | null | undefined>;

type YandexMetrikaInitParams = {
  ssr?: boolean;
  webvisor?: boolean;
  clickmap?: boolean;
  ecommerce?: string;
  referrer?: string;
  url?: string;
  accurateTrackBounce?: boolean;
  trackLinks?: boolean;
  defer?: boolean;
};

declare global {
  interface Window {
    ym?: (
      counterId: number,
      method: 'init' | 'hit' | 'reachGoal' | 'params',
      target?: string | YandexMetrikaInitParams | YandexMetrikaParams,
      params?: YandexMetrikaParams,
    ) => void;
  }
}

const YANDEX_METRIKA_ID = Number(import.meta.env.VITE_YANDEX_METRIKA_ID);
const IS_YANDEX_METRIKA_ENABLED = import.meta.env.VITE_YANDEX_METRIKA_ENABLED === 'true';

function canUseMetrika() {
  return Boolean(
    IS_YANDEX_METRIKA_ENABLED &&
    YANDEX_METRIKA_ID &&
    typeof window !== 'undefined' &&
    typeof document !== 'undefined',
  );
}

export function initYandexMetrika() {
  if (!canUseMetrika() || window.ym) {
    return;
  }

  const scriptSrc = `https://mc.yandex.ru/metrika/tag.js?id=${YANDEX_METRIKA_ID}`;

  const existedScript = Array.from(document.scripts).some((script) => {
    return script.src === scriptSrc;
  });

  if (!existedScript) {
    const script = document.createElement('script');
    const firstScript = document.getElementsByTagName('script')[0];

    script.async = true;
    script.src = scriptSrc;

    firstScript.parentNode?.insertBefore(script, firstScript);
  }

  window.ym =
    window.ym ||
    function (...args) {
      const ym = window.ym as unknown as {
        a?: unknown[];
        l?: number;
      };

      ym.a = ym.a || [];
      ym.a.push(args);
    };

  window.ym(YANDEX_METRIKA_ID, 'init', {
    webvisor: true,
    clickmap: true,
    accurateTrackBounce: true,
    trackLinks: true,
    referrer: document.referrer,
    url: window.location.href,
  });
}

export function reachGoal(goalName: string, params?: YandexMetrikaParams) {
  if (!canUseMetrika() || !window.ym) {
    return;
  }

  window.ym(YANDEX_METRIKA_ID, 'reachGoal', goalName, params);
}

export function trackPageView(url: string, params?: YandexMetrikaParams) {
  if (!canUseMetrika() || !window.ym) {
    return;
  }

  window.ym(YANDEX_METRIKA_ID, 'hit', url, params);
}
