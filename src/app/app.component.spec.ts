import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { AppComponent } from './app.component';

describe('Navegación principal', () => {
  it('ofrece acceso a libros y autores y un enlace para saltar al contenido', async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [provideRouter([]), provideNoopAnimations()],
    }).compileComponents();
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;

    expect(root.querySelector('nav a[href="/books"]')?.textContent).toContain('Libros');
    expect(root.querySelector('nav a[href="/authors"]')?.textContent).toContain('Autores');
    expect(root.querySelector('.skip-link')?.getAttribute('href')).toBe('#main-content');
  });
});
