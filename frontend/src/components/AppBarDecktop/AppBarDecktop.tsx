import styles from '@components/AppBarDecktop/AppBarDecktop.module.scss';
import Button from '@components/Button/Button';
import plus from '@assets/images/icons/plus.svg';
import home from '@assets/images/icons/home.svg';
import explore from '@assets/images/icons/explore.svg';
import activity from '@assets/images/icons/activity.svg';
import profile from '@assets/images/icons/profile.svg';
import { useMediaQuery } from 'react-responsive';

export default function AppBarDecktop() {
    const isMobile = useMediaQuery({ query: "(min-width: 769px)" });

    return (
        isMobile && (
            <menu className={styles.decktopAppBar}>
                <div className={styles.buttonsWrapper}>
                    <Button
                        type='primary'
                        size='medium'
                        icon={plus}
                    >
                        New habbit
                    </Button>
                    <Button
                        type='outline'
                        size='medium'
                        icon={home}
                    >
                        New habbit
                    </Button>
                    <Button
                        type='outline'
                        size='medium'
                        icon={explore}
                    >
                        New habbit
                    </Button>
                    <Button
                        type='outline'
                        size='medium'
                        icon={activity}
                    >
                        New habbit
                    </Button>
                    <Button
                        type='outline'
                        size='medium'
                        icon={profile}
                    >
                        New habbit
                    </Button>
                </div>
            </menu>
        )

    )
}