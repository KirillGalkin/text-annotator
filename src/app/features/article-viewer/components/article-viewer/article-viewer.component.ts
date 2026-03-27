import { Component, computed, effect, ElementRef, inject, signal, viewChild } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AnnotationService } from '../../../../core/services/annotation.service';
import { ArticleService } from '../../../../core/services/article.service';
import { RangeService } from '../../../../core/services/range.service';
import { AnnotationToolbarComponent, IAnnotationSaveEvent } from '../annotation-toolbar/annotation-toolbar.component';
import { TooltipComponent } from '../tooltip/tooltip.component';

@Component({
  selector: 'app-article-viewer',
  imports: [RouterLink, AnnotationToolbarComponent, TooltipComponent],
  templateUrl: './article-viewer.component.html',
  styleUrl: './article-viewer.component.scss',
})
export class ArticleViewerComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly articleService = inject(ArticleService);
  private readonly annotationService = inject(AnnotationService);
  private readonly rangeService = inject(RangeService);
  
  protected readonly selectionError = signal<string | null>(null);

  protected readonly articleId = this.route.snapshot.paramMap.get('id')!;

  protected readonly article = computed(() =>
    this.articleService.articles().find((a) => a.id === this.articleId)
  );

  protected readonly annotations = computed(() =>
    this.annotationService.annotations().filter((a) => a.articleId === this.articleId)
  );

  private readonly containerRef = viewChild<ElementRef<HTMLElement>>('container');

  protected readonly toolbarVisible = signal(false);
  protected readonly toolbarPosition = signal({ x: 0, y: 0 });

  private pendingOffsets: { startOffset: number; endOffset: number } | null = null;

  constructor() {
    effect(() => {
      const container = this.containerRef()?.nativeElement;
      const article = this.article();
      const annotations = this.annotations();

      if (!container || !article) return;

      container.textContent = article.content;
      this.rangeService.applyAnnotations(container, annotations);
    });
  }

  private hasOverlap(start: number, end: number): boolean {
  return this.annotations().some(
    (a) => start < a.endOffset && end > a.startOffset
  );
}

protected onMouseUp(): void {
  const container = this.containerRef()?.nativeElement;
  if (!container) return;

  const offsets = this.rangeService.getSelectionOffsets(container);
  if (!offsets) {
    this.toolbarVisible.set(false);
    this.selectionError.set(null);
    return;
  }

  if (this.hasOverlap(offsets.startOffset, offsets.endOffset)) {
    window.getSelection()?.removeAllRanges();
    this.selectionError.set('Selection overlaps with an existing annotation');
    this.toolbarVisible.set(false);
    setTimeout(() => this.selectionError.set(null), 3000);
    return;
  }

  this.selectionError.set(null);
  this.pendingOffsets = offsets;

  const selection = window.getSelection()!;
  const rect = selection.getRangeAt(0).getBoundingClientRect();
  const x = Math.max(10, Math.min(rect.left + rect.width / 2 - 140, window.innerWidth - 300));
  const y = Math.max(10, rect.top - 230);

  this.toolbarPosition.set({ x, y });
  this.toolbarVisible.set(true);
}


  protected onAnnotationSave(event: IAnnotationSaveEvent): void {
    if (!this.pendingOffsets) return;

    this.annotationService.add({
      articleId: this.articleId,
      startOffset: this.pendingOffsets.startOffset,
      endOffset: this.pendingOffsets.endOffset,
      color: event.color,
      note: event.note,
    });

    window.getSelection()?.removeAllRanges();
    this.toolbarVisible.set(false);
    this.pendingOffsets = null;
  }

  protected onAnnotationCancel(): void {
    window.getSelection()?.removeAllRanges();
    this.toolbarVisible.set(false);
    this.pendingOffsets = null;
  }

  protected removeAnnotation(id: string): void {
    this.annotationService.remove(id);
  }

  protected getAnnotationText(startOffset: number, endOffset: number): string {
    return this.article()?.content.slice(startOffset, endOffset) ?? '';
  }
}
