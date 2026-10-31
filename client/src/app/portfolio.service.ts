import { HttpClient } from '@angular/common/http';
import { Injectable, InjectionToken, inject } from '@angular/core';
import { Observable, catchError, map, of } from 'rxjs';
import { environment } from '../environments/environment';
import { ContactMessage, Portfolio } from './portfolio.model';

/** Static copy shipped with the site, so it works without the API. */
export const STATIC_DATA_URL = 'data/portfolio.json';

/** Base URL of the .NET API; empty means static mode. */
export const API_URL = new InjectionToken<string>('API_URL', {
  providedIn: 'root',
  factory: () => environment.apiUrl,
});

@Injectable({ providedIn: 'root' })
export class PortfolioService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = inject(API_URL).replace(/\/+$/, '');

  get hasApi(): boolean {
    return this.apiUrl.length > 0;
  }

  /** Loads from the .NET API when configured, falling back to the static file. */
  load(): Observable<Portfolio> {
    const fromStatic = this.http.get<Portfolio>(STATIC_DATA_URL);
    if (!this.hasApi) {
      return fromStatic;
    }
    return this.http
      .get<Portfolio>(`${this.apiUrl}/api/portfolio`)
      .pipe(catchError(() => fromStatic));
  }

  /** Sends through the API; resolves false when there is no API so the caller can use email. */
  sendMessage(message: ContactMessage): Observable<boolean> {
    if (!this.hasApi) {
      return of(false);
    }
    return this.http.post(`${this.apiUrl}/api/contact`, message).pipe(map(() => true));
  }
}
