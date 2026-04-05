'use client';

import { Navbar as NextUINavbar, NavbarContent, NavbarBrand, NavbarItem } from '@nextui-org/navbar';
import NextLink from 'next/link';
import { siteConfig } from '../../../config/site';
import clsx from 'clsx';
import { link as linkStyles } from '@nextui-org/theme';
import Image from 'next/image';
import ohanaLogo from '../../images/ohana-patch.png';

const NavBar = () => {
  return (
    <NextUINavbar maxWidth='xl' position='sticky' style={{ backgroundColor: '#B87333' }}>
      <NavbarContent className='basis-1/5 sm:basis-full' justify='start'>
        <NavbarBrand as='li' className='gap-3 max-w-fit'>
          <NextLink className='flex justify-start items-center gap-1' href='/'>
            <Image src={ohanaLogo.src} alt='ohana logo' width={35} height={35} style={{ width: 'auto', height: 'auto' }} />
            <p className='font-bold text-inherit'>Ohana Motorcycles</p>
          </NextLink>
        </NavbarBrand>
        <ul className='hidden lg:flex gap-4 justify-start ml-2'>
          {siteConfig.navItems.map((item) => (
            <NavbarItem key={item.href}>
              <NextLink
                className={clsx(
                  linkStyles({ color: 'foreground' }),
                  'data-[active=true]:text-primary data-[active=true]:font-medium',
                )}
                color='foreground'
                href={item.href}
              >
                {item.label}
              </NextLink>
            </NavbarItem>
          ))}
        </ul>
      </NavbarContent>
    </NextUINavbar>
  );
};

export default NavBar;
