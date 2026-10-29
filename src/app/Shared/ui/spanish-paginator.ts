import { MatPaginatorIntl } from '@angular/material/paginator';

export function spanishPaginator(): MatPaginatorIntl {
  const paginator = new MatPaginatorIntl();
  paginator.itemsPerPageLabel = 'Filas por página';
  paginator.nextPageLabel = 'Página siguiente';
  paginator.previousPageLabel = 'Página anterior';
  paginator.firstPageLabel = 'Primera página';
  paginator.lastPageLabel = 'Última página';
  paginator.getRangeLabel = (page, size, total) =>
    total === 0
      ? '0 de 0'
      : page * size + 1 + '–' + Math.min((page + 1) * size, total) + ' de ' + total;
  return paginator;
}
