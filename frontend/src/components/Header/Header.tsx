import styles from '@components/Header/Header.module.scss';
import type { ReactNode } from 'react';

export interface IHeaderProps {
    title?: string;
    leftButtonIcon?: ReactNode;
    rightButtonIcon?: ReactNode;
};

export default function Header(props: IHeaderProps) {
    return (
        <header className={styles.header}>
            <div className={styles.statusBar}></div>
            <div className="container">
                <div className={styles.titleWithButtons}>
                    {props.leftButtonIcon}
                    <h5 className={styles.headerTitle}>{props.title}</h5>
                    {props.rightButtonIcon}
                </div>
            </div>
        </header>
    )
}