import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { API_URL, PortfolioService, STATIC_DATA_URL } from './portfolio.service';

function setup(apiUrl: string) {
  TestBed.configureTestingModule({
    providers: [provideHttpClient(), provideHttpClientTesting(), { provide: API_URL, useValue: apiUrl }],
  });
  return { service: TestBed.inject(PortfolioService), http: TestBed.inject(HttpTestingController) };
}

describe('PortfolioService', () => {
  it('uses the API when configured', async () => {
    const { service, http } = setup('https://api.test/');
    const result = firstValueFrom(service.load());
    http.expectOne('https://api.test/api/portfolio').flush({ profile: { name: 'API' } });
    expect((await result).profile.name).toBe('API');
    http.verify();
  });

  it('falls back to the static file when the API fails', async () => {
    const { service, http } = setup('https://api.test');
    const result = firstValueFrom(service.load());
    http.expectOne('https://api.test/api/portfolio').error(new ProgressEvent('error'));
    http.expectOne(STATIC_DATA_URL).flush({ profile: { name: 'Static' } });
    expect((await result).profile.name).toBe('Static');
    http.verify();
  });

  it('reports false for sendMessage in static mode', async () => {
    const { service } = setup('');
    expect(await firstValueFrom(service.sendMessage({ name: 'a', email: 'b', message: 'c' }))).toBe(
      false,
    );
  });
});
