import { Routes } from '@angular/router';

export const BOOK_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/book-list.component').then((module) => module.BookListComponent),
    title: 'Libros · Library',
  },
  {
    path: 'new',
    loadComponent: () =>
      import('./pages/book-form.component').then((module) => module.BookFormComponent),
    title: 'Agregar libro · Library',
  },
  {
    path: ':id/edit',
    loadComponent: () =>
      import('./pages/book-form.component').then((module) => module.BookFormComponent),
    title: 'Editar libro · Library',
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./pages/book-detail.component').then((module) => module.BookDetailComponent),
    title: 'Detalle de libro · Library',
  },
];
