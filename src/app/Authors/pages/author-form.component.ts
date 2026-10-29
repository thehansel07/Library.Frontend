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
import { MatSelectModule } from '@angular/material/select';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar } from '@angular/material/snack-bar';
import { finalize } from 'rxjs';
import { AuthorService } from '../services/author.service';
import { Author } from '../models/author';
import { CatalogService } from '../../Shared/data/catalog.service';
import { apiErrorMessage } from '../../Shared/api/api-error';

@Component({
  selector: 'app-author-form',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatProgressBarModule,
  ],
  templateUrl: './author-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuthorFormComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly service = inject(AuthorService);
  private readonly snackbar = inject(MatSnackBar);
  private readonly destroyRef = inject(DestroyRef);
  private readonly formBuilder = inject(FormBuilder);
  readonly catalog = inject(CatalogService);
  private readonly routeId = this.route.snapshot.paramMap.get('id');
  readonly editing = this.routeId !== null;
  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly loadError = signal('');
  readonly saveError = signal('');
  readonly originalBookId = signal<number | null>(null);
  readonly sortedBooks = computed(() =>
    [...this.catalog.books.items()].sort((a, b) =>
      (a.title || '').localeCompare(b.title || '', 'es', { numeric: true })
    )
  );
  readonly missingBook = computed(() => {
    const id = this.originalBookId();
    return id !== null && this.catalog.books.loaded() && !this.catalog.books.find(id) ? id : null;
  });
  readonly form = this.formBuilder.nonNullable.group({
    id: [
      this.catalog.authors.nextId(),
      [
        Validators.required,
        Validators.min(1),
        Validators.max(2147483647),
        Validators.pattern(/^\d+$/),
      ],
    ],
    firstName: ['', [Validators.required, Validators.maxLength(100), Validators.pattern(/\S/)]],
    lastName: ['', [Validators.required, Validators.maxLength(100), Validators.pattern(/\S/)]],
    idBook: [
      Number(this.route.snapshot.queryParamMap.get('bookId')) || 0,
      [Validators.required, Validators.min(1)],
    ],
  });

  constructor() {
    this.catalog.loadBooks();
    this.catalog.loadAuthors();
    effect(() => {
      if (!this.editing && this.catalog.authors.loaded() && !this.form.controls.id.dirty) {
        this.form.controls.id.setValue(this.catalog.authors.nextId());
      }
    });
    if (this.editing) {
      this.loadAuthor(Number(this.routeId));
    }
  }

  private loadAuthor(id: number): void {
    if (!Number.isInteger(id) || id < 1) {
      this.loadError.set('El identificador del autor no es válido.');
      return;
    }
    if (this.catalog.authors.isRemoved(id)) {
      this.loadError.set('Este registro fue eliminado durante la sesión.');
      return;
    }
    const cached = this.catalog.authors.find(id);
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
        next: (author) => this.fillForm(author),
        error: (error) => this.loadError.set(apiErrorMessage(error)),
      });
  }

  private fillForm(author: Author): void {
    this.originalBookId.set(author.idBook);
    this.form.setValue({
      id: author.id,
      firstName: author.firstName || '',
      lastName: author.lastName || '',
      idBook: author.idBook,
    });
  }

  save(): void {
    if (this.form.invalid || this.saving()) {
      this.form.markAllAsTouched();
      return;
    }
    const values = this.form.getRawValue();
    if (!this.editing && this.catalog.authors.find(values.id)) {
      this.form.controls.id.setErrors({ duplicate: true });
      this.form.controls.id.markAsTouched();
      return;
    }
    const author: Author = {
      ...values,
      firstName: values.firstName.trim(),
      lastName: values.lastName.trim(),
    };
    this.saving.set(true);
    this.saveError.set('');
    const request = this.editing
      ? this.service.update(Number(this.routeId), author)
      : this.service.create(author);
    request
      .pipe(
        finalize(() => this.saving.set(false)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (saved) => {
          this.catalog.authors.upsert(saved || author);
          this.snackbar.open(
            this.editing ? 'Cambios guardados.' : 'Autor agregado al catálogo.',
            'Cerrar',
            { duration: 4000 }
          );
          void this.router.navigate(['/authors']);
        },
        error: (error) => this.saveError.set(apiErrorMessage(error)),
      });
  }
}
