import AppBarDecktop from '@components/AppBarDecktop/AppBarDecktop';
import AppBarMobile from '@components/AppBarMobile/AppBarMobile';
import ResponsiveHeader from '@components/Header/ResponsiveHeader';
import type { ReactNode } from 'react';
import styles from '@components/Layout/Layout.module.scss';

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className={styles.appContainer}>
      {/* <AppBarMobile /> */}
      <AppBarDecktop />
      <div className={styles.mainContainer}>
        <ResponsiveHeader />
        <main>{children}</main>
      </div>
    </div>
  );
}