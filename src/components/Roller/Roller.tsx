import { Display } from './Display';
import { GoButton } from './GoButton';
import styles from './index.module.scss';

export function Roller() {
  return (
    <div className={styles.Roller}>
      <Display />
      <GoButton />
    </div>
  );
}
