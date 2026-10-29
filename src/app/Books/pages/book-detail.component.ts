import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  inject,
  signal,
} from '@angular/core';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { catchError, finalize, of, switchMap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { BookService } from '../services/book.service';
import { Book } from '../models/book';
import { authorName } from '../../Authors/models/author';
import { CatalogService } from '../../Shared/data/catalog.service';
import { BookCoverComponent } from '../../Shared/ui/book-cover.component';
import { EmptyStateComponent } from '../../Shared/ui/empty-state.component';
import { apiErrorMessage } from '../../Shared/api/api-error';

@Component({
  selector: 'app-book-detail',
  imports: [
    DatePipe,
    RouterLink,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    BookCoverComponent,
    EmptyStateComponent,
  ],
  templateUrl: './book-detail.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BookDetailComponent {
  readonly catalog = inject(CatalogService);
  private readonly service = inject(BookService);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);
  private readonly fetchedBook = signal<Book | null>(null);
  readonly id = signal(0);
  readonly loading = signal(true);
  readonly error = signal('');
  readonly book = computed(() => this.catalog.books.find(this.id()) || this.fetchedBook());
  readonly authors = computed(() => this.catalog.authorsFor(this.id()));
  readonly authorName = authorName;

  constructor() {
    this.catalog.loadAuthors();
    this.route.paramMap
      .pipe(
        switchMap((params) => {
          const id = Number(params.get('id'));
          this.id.set(id);
          this.fetchedBook.set(null);
          this.error.set('');
          if (!Number.isInteger(id) || id < 1) {
            this.loading.set(false);
            this.error.set('El identificador del libro no es válido.');
            return of(null);
          }
          if (this.catalog.books.isRemoved(id)) {
            this.loading.set(false);
            this.error.set('Este libro fue eliminado durante la sesión.');
            return of(null);
          }
          const cached = this.catalog.books.find(id);
          this.loading.set(!cached);
          return (cached ? of(cached) : this.service.getById(id)).pipe(
            catchError((error) => {
              this.error.set(apiErrorMessage(error));
              return of(null);
            }),
            finalize(() => this.loading.set(false))
          );
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((book) => this.fetchedBook.set(book));
  }
}
