import { Injectable, inject } from "@angular/core";
import { LOCAL_STORAGE } from "../tokens/local-storage.token";

@Injectable({ providedIn: 'root' })
export class StorageService {
  private readonly storage = inject(LOCAL_STORAGE);

  get<T>(key: string): T[] {
    const raw = this.storage.getItem(key);
    return raw ? (JSON.parse(raw) as T[]) : [];
  }

  set<T>(key: string, items: T[]): void {
    this.storage.setItem(key, JSON.stringify(items));
  }
}