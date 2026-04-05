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
    },
    {
      label: 'Usuarios',
      href: '/users',
    },
    {
      label: 'Venta de productos',
      href: '/products',
    },
  ],
  navMenuItems: [],
};
