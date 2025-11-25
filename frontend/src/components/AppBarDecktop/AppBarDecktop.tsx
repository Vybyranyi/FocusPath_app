import styles from '@components/AppBarDecktop/AppBarDecktop.module.scss';
import Button from '@components/Button/Button';
import plus from '@assets/images/icons/plus.svg';
import home from '@assets/images/icons/home.svg';
import explore from '@assets/images/icons/explore.svg';
import activity from '@assets/images/icons/activity.svg';
import profile from '@assets/images/icons/profile.svg';
import { useMediaQuery } from 'react-responsive';
import { useNavigate } from 'react-router';

export default function AppBarDecktop() {
    const isMobile = useMediaQuery({ query: "(min-width: 769px)" });
    const navigate = useNavigate();

    return (
        isMobile && (
            <menu className={styles.decktopAppBar}>
                <div className={styles.buttonsWrapper}>
                    <Button
                        type='primary'
                        size='medium'
                        icon={plus}
                        onClick={() => navigate('/createhabit')}
                    >
                        New habbit
                    </Button>
                    <Button
                        type='outline'
                        size='medium'
                        icon={home}
                        onClick={() => navigate('/main')}
                    >
                        Home
                    </Button>
                    <Button
                        type='outline'
                        size='medium'
                        icon={explore}
                    >
                        Explore
                    </Button>
                    <Button
                        type='outline'
                        size='medium'
                        icon={activity}
                    >
                        Activity
                    </Button>
                    <Button
                        type='outline'
                        size='medium'
                        icon={profile}
                    >
                        Profile
                    </Button>
                </div>
            </menu>
        )

    )
}