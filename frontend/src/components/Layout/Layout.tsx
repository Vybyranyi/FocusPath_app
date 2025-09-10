import AppBarDecktop from '@components/AppBarDecktop/AppBarDecktop';
import AppBarMobile from '@components/AppBarMobile/AppBarMobile';
import ResponsiveHeader from '@components/Header/ResponsiveHeader';
import type { ReactNode } from 'react';
import styles from '@components/Layout/Layout.module.scss';
import { useLocation } from 'react-router';

export default function Layout({ children }: { children: ReactNode }) {
  const location = useLocation();

  const pagesWithoutAppBar = ['/login', '/register'];
  const shouldHideAppBar = pagesWithoutAppBar.includes(location.pathname);

  return (
    <div className={`${styles.appContainer} ${shouldHideAppBar ? styles.noAppBar : ''}`}>
      {!shouldHideAppBar && <AppBarMobile />}
      {!shouldHideAppBar && <AppBarDecktop />}
      <div className={styles.mainContainer}>
        <ResponsiveHeader />
        <main>{children}</main>
      </div>
    </div>
  );
}