import styles from '@components/Header/Header.module.scss';
import type { ReactNode } from 'react';
import { useAppSelector } from "@store/hooks";
import { Emoji } from 'react-apple-emojis';
import default_user from '@assets/images/default_user.png';
import medal_gold from '@assets/images/icons/medal_gold.svg';
import SegmentControl from '@components/SegmentControl/SegmentControl';
import WeekSelector from '@components/WeekSelector/WeekSelector';

export interface IHeaderProps {
    title?: string;
    leftButtonIcon?: ReactNode;
    rightButtonIcon?: ReactNode;
    topContent?: boolean;
    profile?: boolean;
    segmentControl?: boolean;
    showWeekController?: boolean;
};

export default function Header(props: IHeaderProps) {
    const { user } = useAppSelector(state => state.auth);

    const segments = [
        { id: '1', label: 'Habits' },
        { id: '2', label: 'Challenges' },
    ];

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

                {props.profile && (
                    <div className={styles.profileBlock}>
                        <img className={styles.profileImage} src={default_user} alt="User profile photo" />
                        <div className={styles.profileText}>
                            <p className='title'>{`${user?.name} ${user?.surname}`}</p>
                            <span className={styles.pointCounter}>
                                <img src={medal_gold} alt="gold medal" />
                                <p className='body-bold'>{`1452 Points`}</p>
                            </span>
                        </div>
                        <div className={styles.desctopButtons}>
                            {props.leftButtonIcon}
                            {props.rightButtonIcon}
                        </div>
                    </div>
                )}

                {props.segmentControl && (
                    <div className={styles.segmentControlBlock}>
                        <SegmentControl
                            segments={segments}
                            defaultSelectedId='1'
                            onSelect={(id) => console.log(id)}
                        />
                    </div>

                )}

                {props.showWeekController && (
                    <div className={styles.weekSelectorBlock}>
                        <WeekSelector />
                    </div>

                )}

            </div>
        </header>
    )
}