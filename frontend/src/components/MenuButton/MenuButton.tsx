import styles from '@components/MenuButton/MenuButton.module.scss';
import home from '@assets/images/icons/home.svg';
import homeActive from '@assets/images/icons/home_active.svg';
import explore from '@assets/images/icons/explore.svg';
import exploreActive from '@assets/images/icons/explore_active.svg';
import activity from '@assets/images/icons/activity.svg';
import activityActive from '@assets/images/icons/activity_active.svg';
import profile from '@assets/images/icons/profile.svg';
import profileActive from '@assets/images/icons/profile_active.svg';

const iconsMap = {
    home: { default: home, active: homeActive },
    explore: { default: explore, active: exploreActive },
    activity: { default: activity, active: activityActive },
    profile: { default: profile, active: profileActive },
};

export interface IMenuButton {
    icon: keyof typeof iconsMap;
    active?: boolean;
    dot?: boolean;
    onClick?: () => void;
}

export default function MenuButton(props: IMenuButton) {
    const iconSrc = props.active ? iconsMap[props.icon].active : iconsMap[props.icon].default;

    return (
        <button
            className={`${styles.menuButton} ${props.active ? styles.active : ""}`}
            onClick={props.onClick}
        >
            <img src={iconSrc} alt={props.icon} className={styles.icon} />
            {props.dot && <span className={styles.dot} />}
        </button>
    )
}