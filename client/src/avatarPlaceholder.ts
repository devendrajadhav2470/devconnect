/**
 * Local placeholder so avatars work offline and are not blocked (unreliable third-party placeholder hosts).
 */
const base = import.meta.env.BASE_URL.endsWith('/')
  ? import.meta.env.BASE_URL
  : `${import.meta.env.BASE_URL}/`;

export const AVATAR_PLACEHOLDER = `${base}avatar-placeholder.svg`;

export function getAvatarUrl(image?: string | null): string {
  const s = image?.trim();
  if (!s) return AVATAR_PLACEHOLDER;
  if (s.includes('via.placeholder.com')) return AVATAR_PLACEHOLDER;
  return s;
}
