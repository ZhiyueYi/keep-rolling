import { WishList } from './WishList';
import styles from './index.module.scss';

export function SettingPanel() {
  return (
    <div className={styles.settingPanel}>
      <h1 className={styles.title}>Tell me about your wish list!</h1>
      <WishList />
    </div>
  );
}
