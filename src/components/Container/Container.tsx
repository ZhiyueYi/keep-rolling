import { Roller } from '../Roller';
import styles from './index.module.scss';

export function Container() {
  return (
    <div className={styles.container}>
      <Roller />
    </div>
  );
}
