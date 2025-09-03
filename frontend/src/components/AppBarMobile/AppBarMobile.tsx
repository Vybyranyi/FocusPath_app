import styles from '@components/AppBarMobile/AppBarMobile.module.scss';
import MenuButton from '@components/MenuButton/MenuButton';
import plus from '@assets/images/icons/plus.svg';
import { useMediaQuery } from "react-responsive";

export default function AppBarMobile() {
    const isMobile = useMediaQuery({ query: "(max-width: 768px)" });

    const unavailablePage = (): void => {
        alert('Unavailable Page');
    };


    return (
        isMobile && (
            <menu className={styles.mobileAppBar}>
                <MenuButton icon='home' active onClick={unavailablePage}/>
                <MenuButton icon='explore' onClick={unavailablePage}/>
                <button className={styles.addButton}>
                    <img src={plus} alt="add button" />
                </button>
                <MenuButton icon='activity' dot onClick={unavailablePage}/>
                <MenuButton icon='profile' onClick={unavailablePage}/>
            </menu>
        )
    );

}

