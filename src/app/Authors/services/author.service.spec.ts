import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { AuthorService } from './author.service';

describe('Contrato HTTP de autores', () => {
  it('crea la asociación del autor con el libro a través del proxy local', () => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    const service = TestBed.inject(AuthorService);
    const http = TestBed.inject(HttpTestingController);
    const author = { id: 30, idBook: 4, firstName: 'Ada', lastName: 'Lovelace' };

    service.create(author).subscribe();
    const request = http.expectOne('/api/v1/authors');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(author);
    request.flush(author);
    http.verify();
  });
});
