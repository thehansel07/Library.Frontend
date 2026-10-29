import { signal } from '@angular/core';
import { Observable, finalize } from 'rxjs';
import { apiErrorMessage } from '../api/api-error';

export class SessionCollection<T extends { id: number }> {
  private readonly changes = new Map<number, T | null>();
  private readonly records = signal<T[]>([]);
  private readonly pending = signal(false);
  private readonly failure = signal('');
  private readonly ready = signal(false);

  readonly items = this.records.asReadonly();
  readonly loading = this.pending.asReadonly();
  readonly error = this.failure.asReadonly();
  readonly loaded = this.ready.asReadonly();

  load(request: () => Observable<T[]>, refresh = false): void {
    if (this.pending() || (this.ready() && !refresh)) {
      return;
    }

    this.pending.set(true);
    this.failure.set('');
    request()
      .pipe(finalize(() => this.pending.set(false)))
      .subscribe({
        next: (records) => {
          const merged = new Map(records.map((record) => [record.id, record]));
          // FakeRestAPI acepta escrituras sin persistirlas. Conservamos sus respuestas durante la sesión.
          for (const [id, record] of this.changes) {
            record === null ? merged.delete(id) : merged.set(id, record);
          }
          this.records.set([...merged.values()]);
          this.ready.set(true);
        },
        error: (error) => this.failure.set(apiErrorMessage(error)),
      });
  }

  find(id: number): T | undefined {
    return this.records().find((record) => record.id === id);
  }

  upsert(record: T): void {
    this.changes.set(record.id, record);
    this.records.update((records) => {
      const exists = records.some((item) => item.id === record.id);
      return exists
        ? records.map((item) => (item.id === record.id ? record : item))
        : [...records, record];
    });
  }

  remove(id: number): void {
    this.changes.set(id, null);
    this.records.update((records) => records.filter((record) => record.id !== id));
  }

  isRemoved(id: number): boolean {
    return this.changes.get(id) === null;
  }

  nextId(): number {
    return Math.max(0, ...this.records().map((record) => record.id)) + 1;
  }
}
