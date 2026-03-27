import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { form, FormField, required, submit } from '@angular/forms/signals';
import { ArticleService } from '../../core/services/article.service';
import { AnnotationService } from '../../core/services/annotation.service';
import { IAnnotation } from '../../core/models/annotation.model';

@Component({
  selector: 'app-article-form',
  imports: [FormField, RouterLink],
  templateUrl: './article-form.component.html',
  styleUrl: './article-form.component.scss',
})
export class ArticleFormComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly articleService = inject(ArticleService);
  private readonly annotationService = inject(AnnotationService);

  protected readonly articleId = this.route.snapshot.paramMap.get('id');
  protected readonly isEdit = !!this.articleId;

  private readonly existing = this.articleId
    ? this.articleService.getById(this.articleId)
    : undefined;

  protected readonly model = signal({
    title: this.existing?.title ?? '',
    content: this.existing?.content ?? '',
  });

  protected readonly articleForm = form(this.model, (s) => {
    required(s.title, { message: 'Title is required' });
    required(s.content, { message: 'Content is required' });
  });

  protected readonly affectedAnnotations = signal<IAnnotation[]>([]);

  protected onSubmit(): void {
    submit(this.articleForm, async () => {
      if (this.articleId && this.existing) {
        const affected = this.findAffectedAnnotations(
          this.existing.content,
          this.model().content
        );

        if (affected.length > 0) {
          this.affectedAnnotations.set(affected);
          return;
        }
      }

      await this.save();
    });
  }

  protected getAnnotationText(annotation: IAnnotation): string {
    return this.existing!.content.slice(annotation.startOffset, annotation.endOffset);
  }

  protected async confirmSave(): Promise<void> {
    this.affectedAnnotations().forEach((a) => this.annotationService.remove(a.id));
    this.affectedAnnotations.set([]);
    await this.save();
  }

  protected cancelConfirm(): void {
    this.affectedAnnotations.set([]);
  }

  private findAffectedAnnotations(oldContent: string, newContent: string): IAnnotation[] {
    return this.annotationService.getForArticle(this.articleId!).filter((a) => {
      const original = oldContent.slice(a.startOffset, a.endOffset);
      const updated = newContent.slice(a.startOffset, a.endOffset);
      return original !== updated;
    });
  }

  private async save(): Promise<void> {
    const { title, content } = this.model();
    if (this.articleId) {
      this.articleService.update(this.articleId, title, content);
      await this.router.navigate(['/article', this.articleId]);
    } else {
      const article = this.articleService.create(title, content);
      await this.router.navigate(['/article', article.id]);
    }
  }
}
