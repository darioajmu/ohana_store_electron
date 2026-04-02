export type SiteConfig = typeof siteConfig;

export const siteConfig = {
  name: 'Ohana Motorcycles',
  description: 'Gestion para la entrega de productos por donaciones',
  navItems: [
    {
      label: 'Compras',
      href: '/',
    },
    {
      label: 'Stock',
      href: '/stock',
    },
    {
      label: 'Historico',
      href: '/orders',
    }
  ],
  navMenuItems: [],
};
