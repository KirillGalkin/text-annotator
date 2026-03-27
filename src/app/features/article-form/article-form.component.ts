import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { form, FormField, required, submit } from '@angular/forms/signals';
import { ArticleService } from '../../core/services/article.service';

@Component({
  selector: 'app-article-form',
  imports: [FormField, RouterLink],
  templateUrl: './article-form.component.html',
  styleUrl: './article-form.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ArticleFormComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly articleService = inject(ArticleService);

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

  protected onSubmit(): void {
    submit(this.articleForm, async () => {
      const { title, content } = this.model();
      if (this.articleId) {
        this.articleService.update(this.articleId, title, content);
        await this.router.navigate(['/article', this.articleId]);
      } else {
        const article = this.articleService.create(title, content);
        await this.router.navigate(['/article', article.id]);
      }
    });
  }
}
