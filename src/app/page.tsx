import Link from 'next/link';
import { Sofa } from 'lucide-react';
import styles from './page.module.css';

export default function Home() {
  return (
    <main className={styles.container}>
      <div className={styles.content}>
        <h1 className={styles.title} style={{ color: 'var(--color-gold-primary)' }}>My Home Sofas</h1>
        <p className={styles.subtitle} style={{ color: 'white', textShadow: '0 2px 4px rgba(0,0,0,0.8)', fontWeight: 500 }}>
          Enterprise Resource Planning & Customer Relationship Management
        </p>
        
        <div className={styles.buttonGroup}>
          <Link href="/login" className="btn btn-primary" style={{ fontSize: '1.1rem', padding: '1rem 2.5rem' }}>
            Login to System
          </Link>
        </div>
      </div>
    </main>
  );
}
