import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, isDevMode, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { filter, finalize, switchMap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CatalogService } from '../../Shared/data/catalog.service';
import { BookCoverComponent } from '../../Shared/ui/book-cover.component';
import { EmptyStateComponent } from '../../Shared/ui/empty-state.component';
import { ConfirmDeleteComponent } from '../../Shared/ui/confirm-delete.component';
import { apiErrorMessage } from '../../Shared/api/api-error';
import { authorName } from '../../Authors/models/author';
import { BookService } from '../services/book.service';
import { Book } from '../models/book';

@Component({
  selector: 'app-book-list',
  imports: [
    DatePipe, RouterLink, MatButtonModule, MatIconModule,
    MatFormFieldModule, MatInputModule, MatSelectModule, MatPaginatorModule,
    MatTooltipModule, MatProgressBarModule, BookCoverComponent, EmptyStateComponent,
  ],
  templateUrl: './book-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BookListComponent {
  readonly catalog = inject(CatalogService);
  private readonly service = inject(BookService);
  private readonly dialog = inject(MatDialog);
  private readonly snackbar = inject(MatSnackBar);
  private readonly destroyRef = inject(DestroyRef);

  readonly query = signal('');
  readonly sort = signal("title");
  readonly pageSize = signal(10);
  private readonly requestedPage = signal(0);
  readonly deleting = signal<number | null>(null);

  readonly filteredBooks = computed(() => {
    const searchText = this.query().trim().toLocaleLowerCase('es');
    const orderBy = this.sort();

    // TODO: revisar la busqueda local si el catalogo crece bastante.
    const books = this.catalog.books.items().filter(book => {
      const text = [book.title, book.description, this.namesFor(book.id)].join(' ');
      return text.toLocaleLowerCase('es').includes(searchText);
    });

    books.sort((a, b) => {
      if (orderBy === 'date') {
        return Date.parse(b.publishDate) - Date.parse(a.publishDate);
      }
      if (orderBy === 'pages') return b.pageCount - a.pageCount;

      return (a.title || '').localeCompare(b.title || '', 'es', { numeric: true });
    });
    return books;
  });

  readonly pageIndex = computed(() => {
    const lastPage = Math.max(0, Math.ceil(this.filteredBooks().length / this.pageSize()) - 1);
    // Al borrar la ultima fila no queremos quedarnos en una pagina vacia.
    return Math.min(this.requestedPage(), lastPage);
  });

  readonly visibleBooks = computed(() => {
    const start = this.pageIndex() * this.pageSize();
    return this.filteredBooks().slice(start, start + this.pageSize());
  });

  readonly linkedBooks = computed(() => {
    const ids = new Set(this.catalog.authors.items().map(author => author.idBook));
    return this.catalog.books.items().filter(book => ids.has(book.id)).length;
  });

  constructor() {
    this.catalog.loadBooks();
    this.catalog.loadAuthors();
  }

  search(value: string): void {
    this.query.set(value);
    this.requestedPage.set(0);
  }

  changePage(event: PageEvent): void {
    this.pageSize.set(event.pageSize);
    this.requestedPage.set(event.pageIndex);
  }


  namesFor(bookId: number): string {
    const autores = this.catalog.authorsFor(bookId);
    return autores.map(authorName).join(', ') || 'Sin autor asociado';
  }

  refresh(): void {
    this.catalog.loadBooks(true);
    this.catalog.loadAuthors(true);
  }

  remove(book: Book): void {
    const confirm = this.dialog.open(ConfirmDeleteComponent, {
      width: '440px',
      data: { kind: 'libro', name: book.title || 'Libro #' + book.id },
    });

    confirm.afterClosed().pipe(
      filter(Boolean),
      switchMap(() => {
        this.deleting.set(book.id);
        return this.service.delete(book.id).pipe(finalize(() => this.deleting.set(null)));
      }),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: () => {
        this.catalog.books.remove(book.id);
        if (isDevMode()) console.log("libro eliminado", book.id);
        this.snackbar.open('Libro eliminado del catálogo.', 'Cerrar', { duration: 4000 });
      },
      error: error => {
        const message = apiErrorMessage(error);
        this.snackbar.open(message, 'Cerrar', { duration: 7000 });
      },
    });
  }
}
