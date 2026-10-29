import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar } from '@angular/material/snack-bar';
import { finalize } from 'rxjs';
import { BookService } from '../services/book.service';
import { CatalogService } from '../../Shared/data/catalog.service';
import { apiErrorMessage } from '../../Shared/api/api-error';
import { Book } from '../models/book';

@Component({
  selector: 'app-book-form',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressBarModule,
  ],
  templateUrl: './book-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BookFormComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly service = inject(BookService);
  private readonly snackbar = inject(MatSnackBar);
  private readonly destroyRef = inject(DestroyRef);
  readonly catalog = inject(CatalogService);
  private readonly formBuilder = inject(FormBuilder);
  private readonly routeId = this.route.snapshot.paramMap.get('id');
  readonly editing = this.routeId !== null;
  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly loadError = signal('');
  readonly saveError = signal('');
  readonly title = computed(() => (this.editing ? 'Editar libro' : 'Un nuevo libro'));
  readonly form = this.formBuilder.nonNullable.group({
    id: [
      this.catalog.books.nextId(),
      [
        Validators.required,
        Validators.min(1),
        Validators.max(2147483647),
        Validators.pattern(/^\d+$/),
      ],
    ],
    title: ['', [Validators.required, Validators.maxLength(300), Validators.pattern(/\S/)]],
    description: ['', Validators.maxLength(12000)],
    pageCount: [
      0,
      [
        Validators.required,
        Validators.min(0),
        Validators.max(2147483647),
        Validators.pattern(/^\d+$/),
      ],
    ],
    publishDate: [new Date().toISOString().slice(0, 10), Validators.required],
    excerpt: ['', Validators.maxLength(20000)],
  });

  constructor() {
    this.catalog.loadBooks();
    effect(() => {
      if (!this.editing && this.catalog.books.loaded() && !this.form.controls.id.dirty) {
        this.form.controls.id.setValue(this.catalog.books.nextId());
      }
    });
    if (this.editing) {
      this.loadBook(Number(this.routeId));
    }
  }

  private loadBook(id: number): void {
    if (!Number.isInteger(id) || id < 1) {
      this.loadError.set('El identificador del libro no es válido.');
      return;
    }
    if (this.catalog.books.isRemoved(id)) {
      this.loadError.set('Este registro fue eliminado durante la sesión.');
      return;
    }
    const cached = this.catalog.books.find(id);
    if (cached) {
      this.fillForm(cached);
      return;
    }
    this.loading.set(true);
    this.service
      .getById(id)
      .pipe(
        finalize(() => this.loading.set(false)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (book) => this.fillForm(book),
        error: (error) => this.loadError.set(apiErrorMessage(error)),
      });
  }

  private fillForm(book: Book): void {
    this.form.setValue({
      id: book.id,
      title: book.title || '',
      description: book.description || '',
      pageCount: book.pageCount,
      publishDate: book.publishDate.slice(0, 10),
      excerpt: book.excerpt || '',
    });
  }

  save(): void {
    if (this.form.invalid || this.saving()) {
      this.form.markAllAsTouched();
      return;
    }

    const values = this.form.getRawValue();
    if (!this.editing && this.catalog.books.find(values.id)) {
      this.form.controls.id.setErrors({ duplicate: true });
      this.form.controls.id.markAsTouched();
      return;
    }

    const book: Book = {
      ...values,
      title: values.title.trim(),
      description: values.description.trim(),
      excerpt: values.excerpt.trim(),
      publishDate: new Date(values.publishDate + 'T00:00:00Z').toISOString(),
    };
    this.saving.set(true);
    this.saveError.set('');
    const request = this.editing
      ? this.service.update(Number(this.routeId), book)
      : this.service.create(book);
    request
      .pipe(
        finalize(() => this.saving.set(false)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (saved) => {
          this.catalog.books.upsert(saved || book);
          this.snackbar.open(
            this.editing ? 'Cambios guardados.' : 'Libro agregado al catálogo.',
            'Cerrar',
            { duration: 4000 }
          );
          void this.router.navigate(['/books', book.id]);
        },
        error: (error) => this.saveError.set(apiErrorMessage(error)),
      });
  }
}
