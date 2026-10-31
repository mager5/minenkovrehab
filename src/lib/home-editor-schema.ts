import { z } from 'zod';

const text = (max: number) =>
  z
    .string()
    .max(max)
    .regex(/^[^<>\x00-\x08\x0b\x0c\x0e-\x1f]*$/);
const color = z.string().regex(/^#[0-9a-fA-F]{6}$/);
const image = z
  .string()
  .max(240)
  .regex(/^(|\/images\/[A-Za-z0-9_./ -]+\.(jpg|jpeg|png|webp|avif|svg|gif))$/i);
const link = z
  .string()
  .max(240)
  .regex(
    /^(|#[A-Za-z0-9_-]+|\/(?!\/)[A-Za-z0-9/_?#=&%.~-]*|https:\/\/[A-Za-z0-9.-]+(?::[0-9]+)?(?:\/[A-Za-z0-9/_?#=&%.~@+:-]*)?|mailto:[A-Za-z0-9_.+@-]+|tel:\+?[0-9 -]+)$/
  );
const navLink = z.strictObject({ label: text(100), href: link });
const button = z.strictObject({
  label: text(100),
  href: link,
  variant: z.enum(['primary', 'secondary']),
});
const card = z.strictObject({
  title: text(200),
  text: text(2500),
  image,
  href: link,
  linkLabel: text(80),
});

export const sectionSchema = z.strictObject({
  id: z.string().regex(/^[a-z][a-z0-9-]{0,39}$/),
  kind: z.enum(['hero', 'text', 'split', 'cards', 'stats', 'cta', 'faq']),
  visible: z.boolean(),
  title: text(200),
  eyebrow: text(120),
  paragraphs: z.array(text(5000)).max(12),
  image,
  mobileImage: image,
  imageAlt: text(200),
  imagePosition: z.enum(['background', 'left', 'right', 'none']),
  buttons: z.array(button).max(5),
  cards: z.array(card).max(12),
  stats: z.array(z.strictObject({ value: text(40), label: text(120) })).max(8),
  style: z.strictObject({
    background: color,
    text: color,
    titleColor: color,
    accent: color,
    titleSize: z.number().int().min(20).max(96),
    textSize: z.number().int().min(12).max(32),
    paddingY: z.number().int().min(16).max(180),
    minHeight: z.number().int().min(0).max(1100),
    contentWidth: z.number().int().min(320).max(1440),
    columns: z.number().int().min(1).max(4),
    radius: z.number().int().min(0).max(48),
    align: z.enum(['left', 'center', 'right']),
    imageOverlay: z.number().min(0).max(0.9),
  }),
});

export const homePageSchema = z.strictObject({
  title: text(160).min(1),
  theme: z.strictObject({
    background: color,
    text: color,
    accent: color,
    font: z.enum(['inter', 'system', 'serif']),
  }),
  header: z.strictObject({
    visible: z.boolean(),
    logoText: text(160),
    logoImage: image,
    background: color,
    text: color,
    accent: color,
    height: z.number().int().min(48).max(140),
    sticky: z.boolean(),
    links: z.array(navLink).max(10),
    button: button,
  }),
  footer: z.strictObject({
    visible: z.boolean(),
    title: text(160),
    description: text(2500),
    background: color,
    text: color,
    accent: color,
    links: z.array(navLink).max(16),
    contacts: z.array(navLink).max(10),
    copyright: text(240),
  }),
  sections: z.array(sectionSchema).min(1).max(20),
});
export type HomePage = z.infer<typeof homePageSchema>;
export type HomeSection = z.infer<typeof sectionSchema>;

export const editPlanSchema = z.strictObject({
  summary: text(1200),
  operations: z
    .array(
      z.strictObject({
        op: z.enum(['add', 'replace', 'remove', 'move']),
        path: z.string().max(240),
        from: z.string().max(240),
        valueJson: z.string().max(30000),
      })
    )
    .max(40),
});
export type EditPlan = z.infer<typeof editPlanSchema>;

function pointer(pointer: string) {
  if (!/^\/(title|theme|header|footer|sections)(\/|$)/.test(pointer))
    throw Error('invalid_edit');
  const parts = pointer
    .slice(1)
    .split('/')
    .map(part => part.replace(/~1/g, '/').replace(/~0/g, '~'));
  if (
    parts.some(part => ['__proto__', 'prototype', 'constructor'].includes(part))
  )
    throw Error('invalid_edit');
  return parts;
}

function parentAt(root: Record<string, unknown>, pointerValue: string) {
  const parts = pointer(pointerValue);
  const key = parts.pop()!;
  let parent: any = root;
  for (const part of parts) {
    if (!parent || typeof parent !== 'object' || !Object.hasOwn(parent, part))
      throw Error('invalid_edit');
    parent = parent[part];
  }
  if (!parent || typeof parent !== 'object') throw Error('invalid_edit');
  return { parent, key };
}

function arrayIndex(key: string, length: number, append: boolean) {
  if (append && key === '-') return length;
  if (!/^(0|[1-9][0-9]*)$/.test(key)) throw Error('invalid_edit');
  const index = Number(key);
  if (index >= length + (append ? 1 : 0)) throw Error('invalid_edit');
  return index;
}

export function applyPageEdits(current: HomePage, rawPlan: unknown): HomePage {
  const plan = editPlanSchema.parse(rawPlan);
  const result = structuredClone(current);
  for (const operation of plan.operations) {
    let value: unknown;
    if (operation.op === 'move') {
      const source = parentAt(result, operation.from);
      if (!Array.isArray(source.parent)) throw Error('invalid_edit');
      value = source.parent.splice(
        arrayIndex(source.key, source.parent.length, false),
        1
      )[0];
    } else if (operation.op !== 'remove')
      value = JSON.parse(operation.valueJson);
    const target = parentAt(result, operation.path);
    if (Array.isArray(target.parent)) {
      const index = arrayIndex(
        target.key,
        target.parent.length,
        ['add', 'move'].includes(operation.op)
      );
      if (operation.op === 'remove') target.parent.splice(index, 1);
      else if (operation.op === 'replace') target.parent[index] = value;
      else target.parent.splice(index, 0, value);
    } else {
      if (operation.op === 'remove') delete target.parent[target.key];
      else {
        if (
          operation.op === 'replace' &&
          !Object.hasOwn(target.parent, target.key)
        )
          throw Error('invalid_edit');
        target.parent[target.key] = value;
      }
    }
  }
  const validated = homePageSchema.parse(result);
  const heroes = validated.sections.filter(
    section => section.kind === 'hero' && section.visible
  );
  if (
    heroes.length !== 1 ||
    new Set(validated.sections.map(section => section.id)).size !==
      validated.sections.length
  )
    throw Error('invalid_edit');
  return validated;
}
