import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  inject,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { filter, finalize, switchMap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CatalogService } from '../../Shared/data/catalog.service';
import { EmptyStateComponent } from '../../Shared/ui/empty-state.component';
import { ConfirmDeleteComponent } from '../../Shared/ui/confirm-delete.component';
import { apiErrorMessage } from '../../Shared/api/api-error';
import { AuthorService } from '../services/author.service';
import { Author, authorName } from '../models/author';
import { bookIdsForAuthor } from '../models/author-books';

@Component({
  selector: 'app-author-list',
  imports: [
    RouterLink,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatPaginatorModule,
    MatTooltipModule,
    MatProgressBarModule,
    EmptyStateComponent,
  ],
  templateUrl: './author-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuthorListComponent {
  readonly catalog = inject(CatalogService);
  private readonly service = inject(AuthorService);
  private readonly dialog = inject(MatDialog);
  private readonly snackbar = inject(MatSnackBar);
  private readonly destroyRef = inject(DestroyRef);
  readonly authorName = authorName;
  readonly query = signal('');
  readonly pageSize = signal(10);
  private readonly requestedPage = signal(0);
  readonly deleting = signal<number | null>(null);
  readonly filteredAuthors = computed(() => {
    const query = this.query().trim().toLocaleLowerCase('es');
    return this.catalog.authors
      .items()
      .filter((author) =>
        (authorName(author) + ' ' + author.id).toLocaleLowerCase('es').includes(query)
      )
      .sort((first, second) =>
        authorName(first).localeCompare(authorName(second), 'es', { numeric: true })
      );
  });
  readonly pageIndex = computed(() =>
    Math.min(
      this.requestedPage(),
      Math.max(0, Math.ceil(this.filteredAuthors().length / this.pageSize()) - 1)
    )
  );
  readonly visibleAuthors = computed(() =>
    this.filteredAuthors().slice(
      this.pageIndex() * this.pageSize(),
      (this.pageIndex() + 1) * this.pageSize()
    )
  );

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

  initials(author: Author): string {
    return (
      ((author.firstName?.charAt(0) || '') + (author.lastName?.charAt(0) || '')).toLocaleUpperCase(
        'es'
      ) || 'A'
    );
  }

  bookCount(author: Author): number {
    return bookIdsForAuthor(author, this.catalog.authors.items()).length;
  }

  bookTitle(id: number): string {
    return this.catalog.books.find(id)?.title || 'Libro #' + id;
  }

  refresh(): void {
    this.catalog.loadAuthors(true);
    this.catalog.loadBooks(true);
  }

  remove(author: Author): void {
    this.dialog
      .open(ConfirmDeleteComponent, {
        width: '440px',
        data: { kind: 'autor', name: authorName(author) },
      })
      .afterClosed()
      .pipe(
        filter(Boolean),
        switchMap(() => {
          this.deleting.set(author.id);
          return this.service.delete(author.id).pipe(finalize(() => this.deleting.set(null)));
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: () => {
          this.catalog.authors.remove(author.id);
          this.snackbar.open('Autor eliminado del catálogo.', 'Cerrar', { duration: 4000 });
        },
        error: (error) => this.snackbar.open(apiErrorMessage(error), 'Cerrar', { duration: 7000 }),
      });
  }
}
