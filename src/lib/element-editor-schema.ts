import { z } from 'zod';

export const targetSchema = z.strictObject({
  root: z.enum(['header', 'main', 'footer', 'topbar', 'floating']),
  path: z
    .array(
      z.strictObject({
        tag: z.string().regex(/^[a-z][a-z0-9-]{0,20}$/),
        index: z.number().int().min(0).max(300),
      })
    )
    .max(30),
  kind: z.enum(['element', 'text']),
  textIndex: z.number().int().min(0).max(100),
  tag: z.string().regex(/^[a-z][a-z0-9-]{0,20}$/),
  label: z.string().max(500),
  textEditable: z.boolean(),
  styles: z.record(z.string(), z.string().max(500)),
});
export type EditTarget = z.infer<typeof targetSchema>;
export const properties = [
  'text',
  'color',
  'backgroundColor',
  'backgroundImage',
  'fontSize',
  'fontWeight',
  'fontStyle',
  'textDecoration',
  'textTransform',
  'textAlign',
  'borderRadius',
  'borderColor',
  'borderWidth',
  'padding',
  'paddingTop',
  'paddingBottom',
  'paddingLeft',
  'paddingRight',
  'margin',
  'marginTop',
  'marginBottom',
  'marginLeft',
  'marginRight',
  'width',
  'height',
  'maxWidth',
  'minHeight',
  'opacity',
  'display',
  'src',
  'href',
] as const;
export const changeSchema = z.strictObject({
  property: z.enum(properties),
  value: z.string().max(2000),
});
export const editResultSchema = z.strictObject({
  summary: z.string().max(1000),
  changes: z.array(changeSchema).max(20),
});
export type ElementChange = z.infer<typeof changeSchema>;
export type ElementOverride = {
  target: EditTarget;
  changes: ElementChange[];
  layout?:
    | { group: string; order: number[]; hidden?: number[] | undefined }
    | undefined;
};
export const overrideSchema = z.strictObject({
  target: targetSchema,
  changes: z.array(changeSchema).max(40),
  layout: z
    .strictObject({
      group: z.string().max(60),
      hidden: z.array(z.number().int().min(0).max(100)).max(100).optional(),
      order: z.array(z.number().int().min(0).max(100)).min(2).max(100),
    })
    .optional(),
});
export const overridesSchema = z.array(overrideSchema).max(200);
export const targetKey = (target: EditTarget) =>
  `${target.root}/${target.path.map(part => `${part.tag}:${part.index}`).join('/')}/${target.kind}:${target.textIndex}`;

export function validateChanges(
  target: EditTarget,
  raw: unknown
): ElementChange[] {
  const changes = z.array(changeSchema).max(20).parse(raw);
  const color =
    /^(#[a-f\d]{3}|#[a-f\d]{4}|#[a-f\d]{6}|#[a-f\d]{8}|transparent|white|black|red|blue|green)$/i;
  const size =
    /^(0|auto|none|(?:\d{1,3}|[1-3]\d{3})(?:\.\d{1,2})?(?:px|rem|em|%|vh|vw))$/;
  const image =
    /^\/(?:images|uploads)\/[A-Za-z\d_./ -]+\.(?:png|jpe?g|webp|avif|gif|svg)$/i;
  for (const { property, value } of changes) {
    if (
      target.kind === 'text' &&
      ![
        'text',
        'color',
        'fontSize',
        'fontWeight',
        'fontStyle',
        'textDecoration',
        'textTransform',
      ].includes(property)
    )
      throw Error('text_style_only');
    if (property === 'text') {
      if (
        !target.textEditable ||
        !value.trim() ||
        /[<>\x00-\x08\x0b\x0c\x0e-\x1f]/.test(value)
      )
        throw Error('select_text');
    } else if (['color', 'backgroundColor', 'borderColor'].includes(property)) {
      if (!color.test(value)) throw Error('invalid_edit');
    } else if (property === 'backgroundImage' || property === 'src') {
      if (property === 'src' && target.tag !== 'img')
        throw Error('invalid_edit');
      if (
        !(property === 'backgroundImage' && value === 'none') &&
        (!image.test(value) || value.includes('..') || value.includes('//'))
      )
        throw Error('invalid_image');
    } else if (property === 'href') {
      if (
        target.tag !== 'a' ||
        !/^(#[\w-]+|\/(?!\/)[\w/?#=&%.~-]*|https:\/\/[A-Za-z\d.-]+(?:\/[\w/?#=&%.~@+-]*)?)$/.test(
          value
        ) ||
        /^\/(api|payment|dashboard|login|register)(\/|\?|#|$)/i.test(value)
      )
        throw Error('invalid_edit');
    } else if (property === 'fontWeight') {
      if (!/^(normal|bold|[1-9]00)$/.test(value)) throw Error('invalid_edit');
    } else if (property === 'fontStyle') {
      if (!['normal', 'italic'].includes(value)) throw Error('invalid_edit');
    } else if (property === 'textDecoration') {
      if (!['none', 'underline', 'line-through'].includes(value))
        throw Error('invalid_edit');
    } else if (property === 'textTransform') {
      if (!['none', 'uppercase', 'lowercase', 'capitalize'].includes(value))
        throw Error('invalid_edit');
    } else if (property === 'textAlign') {
      if (!['left', 'center', 'right', 'justify'].includes(value))
        throw Error('invalid_edit');
    } else if (property === 'display') {
      if (
        !['none', 'block', 'inline', 'inline-block', 'flex', 'grid'].includes(
          value
        )
      )
        throw Error('invalid_edit');
    } else if (property === 'opacity') {
      if (!/^(0(?:\.\d{1,2})?|1(?:\.0{1,2})?)$/.test(value))
        throw Error('invalid_edit');
    } else if (!size.test(value)) throw Error('invalid_edit');
  }
  return changes;
}
