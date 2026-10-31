'use client';
import type { CSSProperties } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { HomePage, HomeSection } from '@/lib/home-editor-schema';
import './editable-home.css';

function Section({ section, title }: { section: HomeSection; title: string }) {
  if (!section.visible) return null;
  const { style } = section;
  const background = section.imagePosition === 'background' && section.image;
  const split =
    ['left', 'right'].includes(section.imagePosition) && section.image;
  const variables = {
    '--home-bg': style.background,
    '--home-text': style.text,
    '--home-title': style.titleColor,
    '--home-accent': style.accent,
    '--home-title-size': `${style.titleSize}px`,
    '--home-text-size': `${style.textSize}px`,
    '--home-padding': `${style.paddingY}px`,
    '--home-min-height': `${style.minHeight}px`,
    '--home-width': `${style.contentWidth}px`,
    '--home-columns': style.columns,
    '--home-radius': `${style.radius}px`,
    textAlign: style.align,
  } as CSSProperties;
  const heading = section.kind === 'hero' ? title : section.title;
  return (
    <section
      id={section.id}
      className={`home-edit-section ${section.kind === 'hero' ? 'home-edit-hero' : ''}`}
      style={variables}
    >
      {background && (
        <div className='home-edit-background' aria-hidden='true'>
          <picture>
            {section.mobileImage && (
              <source media='(max-width: 767px)' srcSet={section.mobileImage} />
            )}
            <img src={section.image} alt='' />
          </picture>
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: '#000',
              opacity: style.imageOverlay,
            }}
          />
        </div>
      )}
      <div
        className={`home-edit-container ${split ? `home-edit-split home-edit-image-${section.imagePosition}` : ''}`}
      >
        {split && (
          <Image
            className='home-edit-photo'
            src={section.image}
            alt={section.imageAlt || heading}
            width={680}
            height={760}
          />
        )}
        <div className={background ? 'home-edit-hero-copy' : 'home-edit-copy'}>
          {section.eyebrow && (
            <p className='home-edit-eyebrow'>{section.eyebrow}</p>
          )}
          {section.kind === 'hero' ? (
            <h1>{heading}</h1>
          ) : heading ? (
            <h2>{heading}</h2>
          ) : null}
          {section.paragraphs.map((paragraph, index) => (
            <p className='home-edit-paragraph' key={index}>
              {paragraph}
            </p>
          ))}
          {section.cards.length > 0 && (
            <div
              className={`home-edit-cards ${section.kind === 'faq' ? 'home-edit-faq' : ''}`}
            >
              {section.cards.map((card, index) =>
                section.kind === 'faq' ? (
                  <details key={index}>
                    <summary>{card.title}</summary>
                    <p>{card.text}</p>
                  </details>
                ) : (
                  <article className='home-edit-card' key={index}>
                    {card.image && (
                      <Image
                        src={card.image}
                        alt={card.title}
                        width={560}
                        height={360}
                      />
                    )}
                    <div className='home-edit-card-copy'>
                      <h3>{card.title}</h3>
                      <p>{card.text}</p>
                      {card.href && (
                        <Link href={card.href} className='home-edit-card-link'>
                          {card.linkLabel || 'Подробнее'} →
                        </Link>
                      )}
                    </div>
                  </article>
                )
              )}
            </div>
          )}
          {section.stats.length > 0 && (
            <div className='home-edit-stats'>
              {section.stats.map((stat, index) => (
                <div key={index}>
                  <strong>{stat.value}</strong>
                  <span>{stat.label}</span>
                </div>
              ))}
            </div>
          )}
          {section.buttons.length > 0 && (
            <div className='home-edit-buttons'>
              {section.buttons.map((button, index) => (
                <Link
                  key={index}
                  href={button.href || '#'}
                  className={`home-edit-button home-edit-button-${button.variant}`}
                >
                  {button.label}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default function EditableHome({ page }: { page: HomePage }) {
  const fontFamily =
    page.theme.font === 'serif'
      ? 'Georgia, serif'
      : page.theme.font === 'system'
        ? 'system-ui, sans-serif'
        : 'var(--font-inter), system-ui, sans-serif';
  return (
    <div
      className='home-edit-page'
      style={{
        background: page.theme.background,
        color: page.theme.text,
        fontFamily,
      }}
    >
      {page.sections.map(section => (
        <Section key={section.id} section={section} title={page.title} />
      ))}
    </div>
  );
}
