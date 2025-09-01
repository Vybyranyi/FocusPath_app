import styles from '@components/Header/Header.module.scss';
import type { ReactNode } from 'react';
import { useAppSelector } from "@store/hooks";
import { Emoji } from 'react-apple-emojis';

export interface IHeaderProps {
    title?: string;
    leftButtonIcon?: ReactNode;
    rightButtonIcon?: ReactNode;
    topContent?: boolean;
};

export default function Header(props: IHeaderProps) {
    const { user } = useAppSelector(state => state.auth);

    return (
        <header className={styles.header}>
            <div className={`container ${styles.headerWrapper}`}>

                <div className={styles.statusBar}></div>

                {(props.title || props.leftButtonIcon || props.rightButtonIcon) && (
                    <div className={styles.titleWithButtonsBlock}>
                        {props.leftButtonIcon}
                        <h5 className={styles.headerTitle}>{props.title}</h5>
                        {props.rightButtonIcon}
                    </div>
                )}

                {props.topContent && (
                    <div className={styles.topContentBlock}>
                        <div className={styles.topContentText}>
                            <p className='title'>{`Hi, ${user?.name}`} <Emoji className={styles.emojiHand} name='waving hand' /></p>
                            <p className={`body-light ${styles.grayText}`}>Let’s make habits together!</p>
                        </div>
                        <Emoji className={styles.emojiFace} name='smiling face with halo' />
                    </div>
                )}

            </div>
        </header>
    )
}