import { useLayoutEffect, useRef, useState } from 'react';

/**
 * Фикс браузерного поведения: :hover не применяется сразу при появлении
 * элемента под курсором без движения мыши. Проверяем matches(':hover')
 * после монтирования и управляем состоянием через JS.
 */
export function useHoverOnMount() {
  const ref = useRef<HTMLButtonElement>(null);
  const [hovered, setHovered] = useState(false);

  // useLayoutEffect — синхронно до paint, чтобы не было мерцания при монтировании
  useLayoutEffect(() => {
    if (ref.current?.matches(':hover')) {
      setHovered(true); // eslint-disable-line react-hooks/set-state-in-effect
    }
  }, []);

  return {
    ref,
    'data-hovered': hovered ? '' : undefined,
    onMouseEnter: () => setHovered(true),
    onMouseLeave: () => setHovered(false),
  };
}
