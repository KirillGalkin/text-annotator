import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ArticleService } from '../../core/services/article.service';
import { AnnotationService } from '../../core/services/annotation.service';

@Component({
  selector: 'app-article-list',
  imports: [RouterLink],
  templateUrl: './article-list.component.html',
  styleUrl: './article-list.component.scss',
})
export class ArticleListComponent {
  protected readonly articleService = inject(ArticleService);
private readonly annotationService = inject(AnnotationService);

protected deleteArticle(id: string, event: Event): void {
  event.preventDefault();
  event.stopPropagation();
  this.annotationService.removeForArticle(id);
  this.articleService.remove(id);
}

}
