import styles from '@components/AppLoading/AppLoading.module.scss';

export default function AppLoading() {
    return (
        <div className={styles.appLoadingContainer}>
            <div className={styles.loadingElement}>
                <div className={styles.spinner}></div>
                <p className='body-light'>Loading...</p>
            </div>
        </div>
    );
}