import { inject, Injectable, signal } from '@angular/core';
import { IAnnotation } from '../models/annotation.model';
import { StorageService } from './storage.service';
import { CRYPTO } from '../tokens/crypto.token';

const KEY = 'annotations';

@Injectable({ providedIn: 'root' })
export class AnnotationService {
    private readonly crypto = inject(CRYPTO);
  private readonly storage = inject(StorageService);
  private readonly _annotations = signal<IAnnotation[]>(this.storage.get<IAnnotation>(KEY));

  readonly annotations = this._annotations.asReadonly();

  getForArticle(articleId: string): IAnnotation[] {
    return this._annotations().filter((a) => a.articleId === articleId);
  }

  add(data: Omit<IAnnotation, 'id'>): IAnnotation {
    const annotation: IAnnotation = { ...data, id: this.crypto.randomUUID() };
    this._annotations.update((list) => [...list, annotation]);
    this.persist();
    return annotation;
  }

  remove(id: string): void {
    this._annotations.update((list) => list.filter((a) => a.id !== id));
    this.persist();
  }

  removeForArticle(articleId: string): void {
    this._annotations.update((list) => list.filter((a) => a.articleId !== articleId));
    this.persist();
  }

  private persist(): void {
    this.storage.set(KEY, this._annotations());
  }
}
