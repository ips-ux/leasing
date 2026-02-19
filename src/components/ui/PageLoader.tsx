import styles from './PageLoader.module.css';

interface PageLoaderProps {
    /** Additional class on the wrapper — use to control sizing / positioning */
    className?: string;
}

/**
 * Universal deferred loading indicator.
 * Render this only after useDelayedLoading returns true so it never flickers
 * on fast (cached) Firestore loads.
 */
export const PageLoader = ({ className = '' }: PageLoaderProps) => {
    return (
        <div className={`${styles.loaderWrapper} ${className}`}>
            <div className={styles.bar} />
        </div>
    );
};
