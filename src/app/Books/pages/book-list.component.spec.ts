import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { of } from 'rxjs';
import { BookListComponent } from './book-list.component';
import { CatalogService } from '../../Shared/data/catalog.service';

describe('Eliminar un libro desde el listado', () => {
  let component: BookListComponent;
  let catalog: CatalogService;
  let http: HttpTestingController;
  let confirmed: boolean;
  const snackbar = { open: jasmine.createSpy('open') };
  const book = {
    id: 1,
    title: 'Historia',
    description: '',
    pageCount: 20,
    excerpt: '',
    publishDate: '2026-10-28T00:00:00Z',
  };

  beforeEach(() => {
    confirmed = true;
    snackbar.open.calls.reset();
    TestBed.configureTestingModule({
      imports: [BookListComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: MatDialog, useValue: { open: () => ({ afterClosed: () => of(confirmed) }) } },
        { provide: MatSnackBar, useValue: snackbar },
      ],
    });
    component = TestBed.createComponent(BookListComponent).componentInstance;
    catalog = TestBed.inject(CatalogService);
    http = TestBed.inject(HttpTestingController);
    http.expectOne('/api/v1/books').flush([book]);
    http.expectOne('/api/v1/authors').flush([]);
  });

  afterEach(() => http.verify());

  it('no envía una petición si se cancela la confirmación', () => {
    confirmed = false;
    component.remove(book);
    http.expectNone('/api/v1/books/1');
    expect(catalog.books.find(1)).toEqual(book);
  });

  it('retira el registro solo cuando el Backend confirma la eliminación', () => {
    component.remove(book);
    const request = http.expectOne('/api/v1/books/1');
    expect(request.request.method).toBe('DELETE');
    expect(catalog.books.find(1)).toEqual(book);
    request.flush(null);
    expect(catalog.books.find(1)).toBeUndefined();
    expect(component.deleting()).toBeNull();
  });

  it('conserva el registro y muestra el error si el Backend rechaza la eliminación', () => {
    component.remove(book);
    http.expectOne('/api/v1/books/1').flush(null, { status: 503, statusText: 'Unavailable' });
    expect(catalog.books.find(1)).toEqual(book);
    expect(component.deleting()).toBeNull();
    expect(snackbar.open).toHaveBeenCalled();
  });

  it('vuelve a una página con datos cuando se elimina la última fila de la última página', () => {
    const secondBook = { ...book, id: 2, title: 'Segunda historia' };
    catalog.books.upsert(secondBook);
    component.changePage({ pageIndex: 1, pageSize: 1, length: 2 });
    component.remove(secondBook);
    http.expectOne('/api/v1/books/2').flush(null);
    expect(component.pageIndex()).toBe(0);
    expect(component.visibleBooks()).toEqual([book]);
  });
});
