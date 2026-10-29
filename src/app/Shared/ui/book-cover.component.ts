import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-book-cover',
  template:
    '<span class="cover-lines" aria-hidden="true"></span><span class="cover-title">{{ title() || "Sin título" }}</span><span class="cover-edition" aria-hidden="true">LIBRARY / {{ id().toString().padStart(3, "0") }}</span>',
  host: {
    class: 'book-cover',
    '[class.cover-sage]': 'id() % 5 === 0',
    '[class.cover-rose]': 'id() % 5 === 1',
    '[class.cover-blue]': 'id() % 5 === 2',
    '[class.cover-gold]': 'id() % 5 === 3',
    '[class.cover-ink]': 'id() % 5 === 4',
    'aria-hidden': 'true',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BookCoverComponent {
  readonly title = input<string | null>('');
  readonly id = input(0);
}
