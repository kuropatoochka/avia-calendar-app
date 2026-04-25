export const PATHS = {
  base: '/',
  hotTickets: '/hottickets',
  search: '/search',
};

export const PAGES = [
  {
    path: PATHS.hotTickets,
    title: 'Выгодные предложения',
  },
  {
    path: PATHS.search,
    title: 'Не знаю, куда лететь',
  },
] as const;
