import React from 'react';
import styles from './Hero.module.css';

interface HeroProps {
  title: string;
  subtitle?: string;
}

const Hero: React.FC<HeroProps> = ({ title, subtitle }) => {
  return (
    <div className={styles.hero}>
      <div className={styles.content}>
        <h1 className={styles.title}>{title}</h1>
        {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
      </div>
    </div>
  );
};

export default Hero; 