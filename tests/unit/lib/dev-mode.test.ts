import { describe, expect, it } from 'vitest';

import { isDevMode } from '../../../lib/utils/dev-mode';

describe('dev-mode utility', () => {
  it('returns true when NEXT_PUBLIC_DEV_MODE=true', () => {
    const original = process.env.NEXT_PUBLIC_DEV_MODE;
    process.env.NEXT_PUBLIC_DEV_MODE = 'true';
    expect(isDevMode()).toBe(true);
    process.env.NEXT_PUBLIC_DEV_MODE = original;
  });

  it('returns false when NEXT_PUBLIC_DEV_MODE is not true', () => {
    const original = process.env.NEXT_PUBLIC_DEV_MODE;
    process.env.NEXT_PUBLIC_DEV_MODE = 'false';
    expect(isDevMode()).toBe(false);
    process.env.NEXT_PUBLIC_DEV_MODE = undefined;
    expect(isDevMode()).toBe(false);
    process.env.NEXT_PUBLIC_DEV_MODE = original;
  });
});
