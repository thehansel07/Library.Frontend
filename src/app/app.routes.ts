import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'books' },
  {
    path: 'books',
    loadChildren: () => import('./Books/books.routes').then((module) => module.BOOK_ROUTES),
  },
  {
    path: 'authors',
    loadChildren: () => import('./Authors/authors.routes').then((module) => module.AUTHOR_ROUTES),
  },
  {
    path: '**',
    loadComponent: () =>
      import('./Shared/ui/not-found.component').then((module) => module.NotFoundComponent),
    title: 'Página no encontrada · Library',
  },
];
