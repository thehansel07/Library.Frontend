import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { API_BASE_URL } from '../../Shared/api/api.config';
import { BookService } from './book.service';

describe('Contrato HTTP de libros', () => {
  let service: BookService;
  let http: HttpTestingController;
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_BASE_URL, useValue: '/api/v1' },
      ],
    });
    service = TestBed.inject(BookService);
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => http.verify());

  it('envía el contrato completo al endpoint versionado y conserva el identificador de ruta al editar', () => {
    const book = {
      id: 21,
      title: 'Historia',
      description: null,
      pageCount: 42,
      excerpt: null,
      publishDate: '2026-10-28T00:00:00Z',
    };
    service.update(21, book).subscribe();
    const request = http.expectOne('/api/v1/books/21');
    expect(request.request.method).toBe('PUT');
    expect(request.request.body).toEqual(book);
    request.flush(book);
  });

  it('acepta una eliminación con cuerpo vacío', () => {
    let completed = false;
    service.delete(21).subscribe({ complete: () => (completed = true) });
    const request = http.expectOne('/api/v1/books/21');
    expect(request.request.method).toBe('DELETE');
    request.flush(null, { status: 200, statusText: 'OK' });
    expect(completed).toBeTrue();
  });
});
