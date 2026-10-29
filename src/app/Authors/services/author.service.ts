import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_BASE_URL } from '../../Shared/api/api.config';
import { Author } from '../models/author';

@Injectable({ providedIn: 'root' })
export class AuthorService {
  private readonly http = inject(HttpClient);
  private readonly url = inject(API_BASE_URL) + '/authors';

  getAll() {
    return this.http.get<Author[]>(this.url);
  }
  getById(id: number) {
    return this.http.get<Author>(this.url + '/' + id);
  }
  create(author: Author) {
    return this.http.post<Author>(this.url, author);
  }
  update(id: number, author: Author) {
    return this.http.put<Author>(this.url + '/' + id, author);
  }
  delete(id: number) {
    return this.http.delete<void>(this.url + '/' + id);
  }
}
