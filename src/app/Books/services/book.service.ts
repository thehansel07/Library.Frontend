import { Injectable, inject, isDevMode } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs';
import { API_BASE_URL } from '../../Shared/api/api.config';
import { Book } from '../models/book';

@Injectable({ providedIn: 'root' })
export class BookService {
  private readonly http = inject(HttpClient);
  private readonly url = inject(API_BASE_URL) + '/books';

  getAll() {
    return this.http.get<Book[]>(this.url).pipe(
      tap(respose => {
        if (isDevMode()) {
          console.log("books cargados", respose.length);
        }
      })
    );
  }

  getById(id: number) {
    const endpoint = this.url + '/' + id;
    return this.http.get<Book>(endpoint);
  }

  create(book: Book) {
    return this.http.post<Book>(this.url, book);
  }
  update(id: number, book: Book) {
    return this.http.put<Book>(this.url + '/' + id, book);
  }

  delete(id: number) {
    // FakeRest puede devolver 200 sin body; HttpClient lo acepta como null.
    return this.http.delete<void>(this.url + '/' + id);
  }
}
