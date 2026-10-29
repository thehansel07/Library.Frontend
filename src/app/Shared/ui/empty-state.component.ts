import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-empty-state',
  imports: [MatButtonModule, MatIconModule],
  template:
    '<div class="empty-state"><mat-icon>{{ icon() }}</mat-icon><h2>{{ title() }}</h2><p>{{ message() }}</p>@if (actionLabel()) {<button mat-stroked-button type="button" (click)="action.emit()">{{ actionLabel() }}</button>}</div>',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmptyStateComponent {
  readonly icon = input('search_off');
  readonly title = input('No hay resultados');
  readonly message = input('');
  readonly actionLabel = input('');
  readonly action = output<void>();
}
