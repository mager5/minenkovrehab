"use client";

import React, { ComponentType } from 'react';
import { useRetina } from '@/hooks/useRetina';

interface WithRetinaProps {
  [key: string]: unknown;
}

type TransformFunction = (value: unknown) => unknown;

/**
 * HOC, который добавляет поддержку Retina к компоненту
 * @param WrappedComponent - оборачиваемый компонент
 * @param retinaProps - пропы, которые нужно модифицировать для Retina
 * (ключ - имя пропа, значение - функция, преобразующая значение пропа для Retina)
 */
export const withRetina = <P extends WithRetinaProps>(
  WrappedComponent: ComponentType<P>,
  retinaProps: Record<string, TransformFunction>
) => {
  const WithRetinaComponent = (props: P) => {
    const isRetina = useRetina();
    
    // Модифицируем пропы для Retina дисплеев
    const enhancedProps = { ...props } as P;
    
    if (isRetina) {
      Object.keys(retinaProps).forEach(propName => {
        if (Object.prototype.hasOwnProperty.call(props, propName)) {
          enhancedProps[propName as keyof P] = retinaProps[propName](props[propName as keyof P]) as P[keyof P];
        }
      });
    }
    
    return <WrappedComponent {...enhancedProps} />;
  };
  
  WithRetinaComponent.displayName = `WithRetina(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`;
  
  return WithRetinaComponent;
};

/**
 * Пример использования:
 * 
 * // Создаем компонент с поддержкой Retina
 * const RetinaBackgroundImage = withRetina(
 *   ({ src, alt, ...props }: { src: string; alt: string; [key: string]: unknown }) => (
 *     <div 
 *       style={{ backgroundImage: `url(${src})` }}
 *       aria-label={alt}
 *       {...props} 
 *     />
 *   ),
 *   { 
 *     // Преобразование src для Retina (например, добавление @2x)
 *     src: (normalSrc: unknown) => {
 *       if (typeof normalSrc === 'string') {
 *         return normalSrc.replace(/\.(png|jpg|jpeg|gif)$/, '@2x.$1');
 *       }
 *       return normalSrc;
 *     }
 *   }
 * );
 * 
 * // Использование
 * <RetinaBackgroundImage src="/images/banner.jpg" alt="Banner" className="..." />
 */

export default withRetina; 