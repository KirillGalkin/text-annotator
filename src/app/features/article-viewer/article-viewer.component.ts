import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ArticleService } from '../../core/services/article.service';

@Component({
  selector: 'app-article-viewer',
  imports: [RouterLink],
  templateUrl: './article-viewer.component.html',
  styleUrl: './article-viewer.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ArticleViewerComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly articleService = inject(ArticleService);

  protected readonly articleId = this.route.snapshot.paramMap.get('id')!;
  protected readonly article = computed(() =>
    this.articleService.articles().find((a) => a.id === this.articleId)
  );
}
