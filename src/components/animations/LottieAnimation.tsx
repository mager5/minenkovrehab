'use client';

import React, { useRef, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
// Удаляем прямой импорт и заменяем его на динамический
// import Lottie, { LottieRefCurrentProps } from 'lottie-react';
import { useInView } from 'framer-motion';
import type { LottieRefCurrentProps } from 'lottie-react';

// Динамический импорт компонента Lottie с отключением SSR
const Lottie = dynamic(() => import('lottie-react'), { ssr: false });

interface LottieAnimationProps {
  animationData: object;
  loop?: boolean;
  autoplay?: boolean;
  className?: string;
  style?: React.CSSProperties;
  playOnHover?: boolean;
  playOnView?: boolean;
  speed?: number;
  onComplete?: () => void;
  onLoopComplete?: () => void;
  onClick?: () => void;
}

const LottieAnimation: React.FC<LottieAnimationProps> = ({
  animationData,
  loop = true,
  autoplay = true,
  className = '',
  style = {},
  playOnHover = false,
  playOnView = false,
  speed = 1,
  onComplete,
  onLoopComplete,
  onClick,
}) => {
  const lottieRef = useRef<LottieRefCurrentProps>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: !loop && playOnView, amount: 0.3 });
  const [isPaused, setIsPaused] = useState(!autoplay || playOnHover || (playOnView && !isInView));

  // Управление анимацией при появлении в поле зрения
  useEffect(() => {
    if (playOnView && lottieRef.current) {
      if (isInView) {
        lottieRef.current.play();
        setIsPaused(false);
      } else if (!loop) {
        lottieRef.current.pause();
        setIsPaused(true);
      }
    }
  }, [isInView, loop, playOnView]);

  // Установка скорости анимации
  useEffect(() => {
    if (lottieRef.current && speed !== 1) {
      lottieRef.current.setSpeed(speed);
    }
  }, [speed]);

  // Обработчики для hover эффекта
  const handleMouseEnter = () => {
    if (playOnHover && lottieRef.current) {
      lottieRef.current.play();
      setIsPaused(false);
    }
  };

  const handleMouseLeave = () => {
    if (playOnHover && lottieRef.current) {
      lottieRef.current.pause();
      setIsPaused(true);
    }
  };

  // Обработчик клика
  const handleClick = () => {
    if (onClick) {
      onClick();
    } else if (lottieRef.current) {
      if (isPaused) {
        lottieRef.current.play();
        setIsPaused(false);
      } else {
        lottieRef.current.pause();
        setIsPaused(true);
      }
    }
  };

  return (
    <div 
      ref={containerRef}
      className={`lottie-animation-container ${className}`}
      style={style}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
    >
      <Lottie
        lottieRef={lottieRef}
        animationData={animationData}
        loop={loop}
        autoplay={!isPaused}
        className="w-full h-full"
        onComplete={onComplete}
        onLoopComplete={onLoopComplete}
      />
    </div>
  );
};

export default LottieAnimation; 