import { Routes } from '@angular/router';

export const AUTHOR_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/author-list.component').then((module) => module.AuthorListComponent),
    title: 'Autores · Library',
  },
  {
    path: 'new',
    loadComponent: () =>
      import('./pages/author-form.component').then((module) => module.AuthorFormComponent),
    title: 'Agregar autor · Library',
  },
  {
    path: ':id/edit',
    loadComponent: () =>
      import('./pages/author-form.component').then((module) => module.AuthorFormComponent),
    title: 'Editar autor · Library',
  },
];
