import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/article-list/article-list.component').then(
        (m) => m.ArticleListComponent
      ),
  },
  {
    path: 'article/new',
    loadComponent: () =>
      import('./features/article-form/article-form.component').then(
        (m) => m.ArticleFormComponent
      ),
  },
  {
    path: 'article/:id/edit',
    loadComponent: () =>
      import('./features/article-form/article-form.component').then(
        (m) => m.ArticleFormComponent
      ),
  },
  {
    path: 'article/:id',
    loadComponent: () =>
      import('./features/article-viewer/components/article-viewer/article-viewer.component').then(
        (m) => m.ArticleViewerComponent
      ),
  },
  {
    path: '**',
    redirectTo: '',
  },
];
