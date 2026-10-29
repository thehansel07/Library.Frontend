import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { BookDetailComponent } from './book-detail.component';

describe('Detalle de libro', () => {
  it('conserva el día de publicación UTC y relaciona los autores por idBook', () => {
    TestBed.configureTestingModule({
      imports: [BookDetailComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: ActivatedRoute, useValue: { paramMap: of(convertToParamMap({ id: '21' })) } },
      ],
    });
    const fixture = TestBed.createComponent(BookDetailComponent);
    const http = TestBed.inject(HttpTestingController);
    http.expectOne('/api/v1/authors').flush([
      { id: 1, idBook: 21, firstName: 'Ada', lastName: 'Lovelace' },
      { id: 2, idBook: 22, firstName: 'Otra', lastName: 'Persona' },
    ]);
    http.expectOne('/api/v1/books/21').flush({
      id: 21,
      title: 'Historia',
      description: 'Descripción',
      pageCount: 42,
      excerpt: '',
      publishDate: '2026-10-28T00:00:00Z',
    });
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;

    expect(root.querySelectorAll('dd')[1].textContent).toMatch(/28.*2026/);
    expect(root.querySelectorAll('.detail-author').length).toBe(1);
    expect(root.querySelector('.detail-author')?.textContent).toContain('Ada Lovelace');
    http.verify();
  });
});
