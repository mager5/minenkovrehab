// Последний открытый этап программы — в localStorage этого браузера. Без хранилища всё работает,
// просто страница открывается на первом этапе.
const KEY = (course: string) => `mr_course_stage:${course}`;

export function readLastStage(course: string, max: number): number | null {
  try {
    const raw = window.localStorage.getItem(KEY(course));
    const n = raw ? Number(raw) : NaN;
    return Number.isInteger(n) && n >= 1 && n <= max ? n : null;
  } catch {
    return null;
  }
}

export function saveLastStage(course: string, stage: number) {
  try {
    window.localStorage.setItem(KEY(course), String(stage));
  } catch {
    /* хранилище недоступно — не запоминаем */
  }
}
