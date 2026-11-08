// Кнопки-«таблетки»: размеры lg 64 / md 54 / sm 48, варианты primary · secondary · tertiary · outline · light.
import Link from 'next/link';
import type {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  ReactNode,
} from 'react';

export type BtnVariant =
  | 'primary'
  | 'secondary'
  | 'tertiary'
  | 'outline'
  | 'light';
export type BtnSize = 'lg' | 'md' | 'sm';

export function btnClass(
  variant: BtnVariant = 'primary',
  size: BtnSize = 'lg',
  extra = ''
) {
  return `ds-btn ds-btn-${size} ds-btn-${variant} ${extra}`.trim();
}

type Common = {
  variant?: BtnVariant;
  size?: BtnSize;
  block?: boolean;
  children: ReactNode;
};

export function Button({
  variant = 'primary',
  size = 'lg',
  block,
  className = '',
  type = 'button',
  children,
  ...rest
}: Common & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type={type}
      className={btnClass(
        variant,
        size,
        `${block ? 'ds-btn-block' : ''} ${className}`
      )}
      {...rest}
    >
      {children}
    </button>
  );
}

/** Ссылка в виде кнопки. Внутренние адреса — через next/link, внешние/tel/mailto — обычный <a>. */
export function ButtonLink({
  href,
  variant = 'primary',
  size = 'lg',
  block,
  className = '',
  children,
  ...rest
}: Common & { href: string } & AnchorHTMLAttributes<HTMLAnchorElement>) {
  const cls = btnClass(
    variant,
    size,
    `${block ? 'ds-btn-block' : ''} ${className}`
  );
  const external = /^(https?:|tel:|mailto:)/.test(href);
  if (external) {
    const isWeb = href.startsWith('http');
    return (
      <a
        href={href}
        className={cls}
        {...(isWeb ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
        {...rest}
      >
        {children}
      </a>
    );
  }
  return (
     
    <Link href={href} className={cls} {...(rest as any)}>
      {children}
    </Link>
  );
}
