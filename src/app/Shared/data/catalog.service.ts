import { Injectable, inject } from '@angular/core';
import { BookService } from '../../Books/services/book.service';
import { AuthorService } from '../../Authors/services/author.service';
import { Book } from '../../Books/models/book';
import { Author } from '../../Authors/models/author';
import { SessionCollection } from './session-collection';

@Injectable({ providedIn: 'root' })
export class CatalogService {
  private readonly bookService = inject(BookService);
  private readonly authorService = inject(AuthorService);

  readonly books = new SessionCollection<Book>();
  readonly authors = new SessionCollection<Author>();

  loadBooks(refresh = false): void {
    this.books.load(() => this.bookService.getAll(), refresh);
  }

  loadAuthors(refresh = false): void {
    this.authors.load(() => this.authorService.getAll(), refresh);
  }

  authorsFor(bookId: number): Author[] {
    return this.authors.items().filter((author) => author.idBook === bookId);
  }
}
