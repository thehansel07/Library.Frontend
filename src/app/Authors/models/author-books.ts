import { Author } from './author';

export function authorKey(author: Author): string {
  return [author.firstName, author.lastName]
    .join(' ')
    .trim()
    .replace(/\s+/g, ' ')
    .toLocaleLowerCase('es');
}

export function bookIdsForAuthor(author: Author, authors: Author[]): number[] {
  const key = authorKey(author);
  return [
    ...new Set(
      authors
        .filter((candidate) => authorKey(candidate) === key)
        .map((candidate) => candidate.idBook)
    ),
  ];
}
