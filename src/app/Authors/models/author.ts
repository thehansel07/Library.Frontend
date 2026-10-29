export interface Author {
  id: number;
  idBook: number;
  firstName: string | null;
  lastName: string | null;
}

export function authorName(author: Author): string {
  return [author.firstName, author.lastName].filter(Boolean).join(' ').trim() || 'Autor sin nombre';
}
