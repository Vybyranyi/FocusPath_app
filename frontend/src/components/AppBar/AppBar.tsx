import styles from '@components/AppBar/AppBar.module.scss';
import MenuButton from '@components/MenuButton/MenuButton';
import plus from '@assets/images/icons/plus.svg';

export default function AppBar () {
    return (
        <menu className={styles.mobileAppBar}>
            <MenuButton icon='home' active />
            <MenuButton icon='explore' />
            <button className={styles.addButton}>
                <img src={plus} alt="add buttom" />
            </button>
            <MenuButton icon='activity' dot/>
            <MenuButton icon='profile' />
        </menu>
    )
}

