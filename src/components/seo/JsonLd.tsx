import { graph } from '@/lib/schema';

/** Вставляет разметку schema.org в HTML страницы (рендерится на сервере). */
export function JsonLd({ nodes }: { nodes: Record<string, unknown>[] }) {
  return (
    <script
      type='application/ld+json'
      dangerouslySetInnerHTML={{ __html: graph(...nodes) }}
    />
  );
}
