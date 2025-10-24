import AppBarDecktop from '@components/AppBarDecktop/AppBarDecktop';
import AppBarMobile from '@components/AppBarMobile/AppBarMobile';
import ResponsiveHeader from '@components/Header/ResponsiveHeader';
import type { ReactNode } from 'react';
import styles from '@components/Layout/Layout.module.scss';
import { useLocation } from 'react-router';

export default function Layout({ children }: { children: ReactNode }) {
  const location = useLocation();

  const pagesWithoutMobileAppBar = ['/login', '/register', '/createhabit'];
  const pagesWithoutDesktopAppBar = ['/login', '/register'];

  const shouldHideMobileAppBar = pagesWithoutMobileAppBar.some((p) => location.pathname.startsWith(p));
  const shouldHideDesktopAppBar = pagesWithoutDesktopAppBar.some((p) => location.pathname.startsWith(p));

  const bothAppBarsHidden = shouldHideMobileAppBar && shouldHideDesktopAppBar;

  return (
    <div
      className={`${styles.appContainer} ${
        bothAppBarsHidden ? styles.noAppBar : ''
      }`}
    >
      {!shouldHideMobileAppBar && <AppBarMobile />}
      {!shouldHideDesktopAppBar && <AppBarDecktop />}
      <div className={styles.mainContainer}>
        <ResponsiveHeader />
        <main>{children}</main>
      </div>
    </div>
  );
}