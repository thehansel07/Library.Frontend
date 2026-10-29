import { bookIdsForAuthor } from './author-books';

describe('Libros asociados a un autor', () => {
  it('cuenta libros distintos sin duplicar asociaciones y reconoce variaciones de espacios y mayúsculas', () => {
    const author = { id: 1, idBook: 8, firstName: 'Ada', lastName: 'Lovelace' };
    const authors = [
      author,
      { id: 2, idBook: 8, firstName: 'ADA', lastName: 'LOVELACE' },
      { id: 3, idBook: 9, firstName: ' Ada ', lastName: 'Lovelace' },
      { id: 4, idBook: 10, firstName: 'Otra', lastName: 'Persona' },
    ];
    expect(bookIdsForAuthor(author, authors)).toEqual([8, 9]);
  });
});
