import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { EmptyStateComponent } from './empty-state.component';

@Component({
  selector: 'app-not-found',
  imports: [RouterLink, MatButtonModule, EmptyStateComponent],
  template:
    '<app-empty-state icon="explore_off" title="Esta página no está en el catálogo" message="Comprueba la dirección o vuelve al listado de libros." /><div class="center"><a mat-flat-button routerLink="/books">Volver a libros</a></div>',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotFoundComponent {}
