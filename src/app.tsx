import { Container } from './components/Container';
import { SettingPanel } from './components/SettingPanel';
import styles from './index.module.scss';

export function App() {
  return (
    <div className={styles.app}>
      <Container />
      <SettingPanel />
    </div>
  );
}
