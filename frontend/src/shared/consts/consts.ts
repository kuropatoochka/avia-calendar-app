export const PATHS = {
  base: '/',
  offer: '/offer',
  search: '/search',
};

export const PAGES = [
  {
    path: PATHS.offer,
    title: 'Выгодные предложения',
  },
  {
    path: PATHS.search,
    title: 'Не знаю, куда лететь',
  },
] as const;
