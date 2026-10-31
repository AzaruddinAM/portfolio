import { Component, effect, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Title } from '@angular/platform-browser';
import { catchError, map, of } from 'rxjs';
import { ContactForm } from './contact-form';
import { Portfolio } from './portfolio.model';
import { PortfolioService } from './portfolio.service';

type LoadState =
  | { kind: 'loading' }
  | { kind: 'ready'; data: Portfolio }
  | { kind: 'error' };

@Component({
  selector: 'app-root',
  imports: [ContactForm],
  templateUrl: './app.html',
})
export class App {
  private readonly title = inject(Title);

  protected readonly state = toSignal(
    inject(PortfolioService)
      .load()
      .pipe(
        map((data): LoadState => ({ kind: 'ready', data })),
        catchError(() => of<LoadState>({ kind: 'error' })),
      ),
    { initialValue: { kind: 'loading' } as LoadState },
  );

  protected readonly menuOpen = signal(false);
  protected readonly year = new Date().getFullYear();
  protected readonly nav = [
    { id: 'about', label: 'About' },
    { id: 'open-source', label: 'Open source' },
    { id: 'products', label: 'Products' },
    { id: 'experience', label: 'Experience' },
    { id: 'contact', label: 'Contact' },
  ];

  constructor() {
    effect(() => {
      const state = this.state();
      if (state.kind === 'ready') {
        const { name, title } = state.data.profile;
        this.title.setTitle(`${name} — ${title}`);
      }
    });
  }

  protected telHref(phone: string): string {
    return `tel:${phone.replace(/\s+/g, '')}`;
  }
}
