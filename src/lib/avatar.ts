import type { SyntheticEvent } from 'react';

/**
 * Default avatar images shipped in `/public`, keyed by account role.
 * "user" (or any unknown/default role) falls back to `/user.jpg`.
 */
export function getDefaultAvatar(role?: string | null): string {
  if (role === 'admin') return '/admin.jpg';
  if (role === 'vendor') return '/vendor.jpg';
  return '/user.jpg';
}

/** Minimal shape shared by every user-like object that renders an avatar. */
export interface AvatarUserLike {
  image?: string | null;
  avatar?: string | null;
  role?: string | null;
}

/**
 * Resolve an avatar URL as `user.image || user.avatar || getDefaultAvatar(role)`.
 * A custom uploaded photo always overrides the role default.
 */
export function getAvatarUrl(user?: AvatarUserLike | null): string {
  return user?.image || user?.avatar || getDefaultAvatar(user?.role);
}

/**
 * `onError` handler for avatar `<img>` tags:
 * 1st failure → swap to the role default avatar;
 * 2nd failure (default also missing) → hide the image so a broken-image
 * icon or ugly placeholder never appears (any initials behind it show through).
 */
export function handleAvatarError(
  event: SyntheticEvent<HTMLImageElement, Event>,
  role?: string | null
): void {
  const img = event.currentTarget;
  if (img.dataset.avatarFallback === 'true') {
    img.style.display = 'none';
    return;
  }
  img.dataset.avatarFallback = 'true';
  img.src = getDefaultAvatar(role);
}
