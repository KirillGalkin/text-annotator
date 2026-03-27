import { inject, Injectable, signal } from '@angular/core';
import { IArticle } from '../models/article.model';
import { StorageService } from './storage.service';
import { CRYPTO } from '../tokens/crypto.token';

const KEY = 'articles';

@Injectable({ providedIn: 'root' })
export class ArticleService {
  private readonly crypto = inject(CRYPTO);
  private readonly storage = inject(StorageService);
  private readonly _articles = signal<IArticle[]>(this.storage.get<IArticle>(KEY));

  readonly articles = this._articles.asReadonly();

  getById(id: string): IArticle | undefined {
    return this._articles().find((a) => a.id === id);
  }

  create(title: string, content: string): IArticle {
    const article: IArticle = {
      id: this.crypto.randomUUID(),
      title,
      content,
    };

    this._articles.update((list) => [...list, article]);
    this.persist();

    return article;
  }

  update(id: string, title: string, content: string): void {
    this._articles.update((list) =>
      list.map((a) => (a.id === id ? { ...a, title, content } : a))
    );
    this.persist();
  }

  remove(id: string): void {
    this._articles.update((list) => list.filter((a) => a.id !== id));
    this.persist();
  }

  private persist(): void {
    this.storage.set(KEY, this._articles());
  }
}
