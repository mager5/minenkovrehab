'use client';
import {
  createContext,
  useContext,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Header } from '@/components/shared/Header';
import Footer from '@/components/shared/Footer';
import type { HomePage } from '@/lib/home-editor-schema';
import './editable-home.css';

const EditorContext = createContext<{
  page: HomePage | null;
  setPage: Dispatch<SetStateAction<HomePage | null>>;
} | null>(null);
export function HomeEditorProvider({
  children,
  initialPage,
}: {
  children: ReactNode;
  initialPage: HomePage | null;
}) {
  const [page, setPage] = useState<HomePage | null>(initialPage);
  return (
    <EditorContext.Provider value={{ page, setPage }}>
      {children}
    </EditorContext.Provider>
  );
}
export function useHomeEditor() {
  const context = useContext(EditorContext);
  if (!context) throw Error('Home editor context missing');
  return context;
}
export function EditableSiteHeader() {
  const pathname = usePathname();
  const { page } = useHomeEditor();
  const header = page?.header;
  if (
    pathname !== '/' ||
    process.env.NEXT_PUBLIC_AI_TEST_ENABLED !== '1' ||
    !header
  )
    return <Header />;
  if (!header.visible) return null;
  return (
    <header
      className='home-edit-site-header'
      style={{
        background: header.background,
        color: header.text,
        minHeight: header.height,
        position: header.sticky ? 'sticky' : 'relative',
        top: 0,
        zIndex: 100,
      }}
    >
      <div className='home-edit-site-header-inner'>
        <Link href='/' className='home-edit-logo'>
          {header.logoImage && (
            <Image src={header.logoImage} alt='' width={54} height={54} />
          )}
          <span>{header.logoText}</span>
        </Link>
        <nav aria-label='Меню главной страницы'>
          {header.links.map((link, index) => (
            <Link key={index} href={link.href || '#'}>
              {link.label}
            </Link>
          ))}
        </nav>
        {header.button.label && (
          <Link
            href={header.button.href || '#'}
            className='home-edit-header-button'
            style={{ background: header.accent, color: '#fff' }}
          >
            {header.button.label}
          </Link>
        )}
      </div>
    </header>
  );
}
export function EditableSiteFooter() {
  const pathname = usePathname();
  const { page } = useHomeEditor();
  const footer = page?.footer;
  if (
    pathname !== '/' ||
    process.env.NEXT_PUBLIC_AI_TEST_ENABLED !== '1' ||
    !footer
  )
    return <Footer />;
  if (!footer.visible) return null;
  return (
    <footer
      aria-label='Подвал сайта'
      className='home-edit-site-footer'
      style={{ background: footer.background, color: footer.text }}
    >
      <div className='home-edit-site-footer-inner'>
        <div>
          <h2>{footer.title}</h2>
          <p>{footer.description}</p>
        </div>
        <nav aria-label='Ссылки в подвале'>
          {footer.links.map((link, index) => (
            <Link key={index} href={link.href || '#'}>
              {link.label}
            </Link>
          ))}
        </nav>
        <div>
          {footer.contacts.map((link, index) => (
            <p key={index}>
              {link.href ? (
                <a href={link.href} style={{ color: footer.accent }}>
                  {link.label}
                </a>
              ) : (
                link.label
              )}
            </p>
          ))}
        </div>
      </div>
      <p className='home-edit-copyright'>{footer.copyright}</p>
    </footer>
  );
}
