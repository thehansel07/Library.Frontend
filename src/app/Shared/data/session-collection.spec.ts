import { of, throwError } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { SessionCollection } from './session-collection';

describe('Cambios confirmados durante la sesión', () => {
  it('mantiene altas, ediciones y eliminaciones al actualizar datos no persistidos por FakeRestAPI', () => {
    const collection = new SessionCollection<{ id: number; title: string }>();
    const original = [
      { id: 1, title: 'Original' },
      { id: 2, title: 'Para eliminar' },
    ];
    collection.load(() => of(original));
    collection.upsert({ id: 1, title: 'Editado' });
    collection.upsert({ id: 3, title: 'Nuevo' });
    collection.remove(2);
    expect(collection.isRemoved(2)).toBeTrue();

    collection.load(() => of(original), true);

    expect(collection.items()).toEqual([
      { id: 1, title: 'Editado' },
      { id: 3, title: 'Nuevo' },
    ]);
  });

  it('no pierde registros si una actualización falla y permite reintentar', () => {
    const collection = new SessionCollection<{ id: number }>();
    collection.load(() => of([{ id: 1 }]));
    collection.load(() => throwError(() => new HttpErrorResponse({ status: 503 })), true);

    expect(collection.items()).toEqual([{ id: 1 }]);
    expect(collection.loading()).toBeFalse();
    expect(collection.error()).toContain('no está disponible');

    collection.load(() => of([{ id: 2 }]), true);
    expect(collection.error()).toBe('');
    expect(collection.items()).toEqual([{ id: 2 }]);
  });
});
