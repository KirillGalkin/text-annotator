import { InjectionToken } from '@angular/core';

export const CRYPTO = new InjectionToken<Crypto>('crypto', {
  providedIn: 'root',
  factory: () => window.crypto,
});