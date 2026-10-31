import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import portfolio from '../../public/data/portfolio.json';
import { App } from './app';
import { Portfolio } from './portfolio.model';
import { API_URL, STATIC_DATA_URL } from './portfolio.service';

describe('App', () => {
  let http: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideHttpClient(), provideHttpClientTesting(), { provide: API_URL, useValue: '' }],
    }).compileComponents();
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('shows a loading state first', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Loading');
    http.expectOne(STATIC_DATA_URL).flush(portfolio);
  });

  it('renders the portfolio sections from the static data', async () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    http.expectOne(STATIC_DATA_URL).flush(portfolio as Portfolio);
    await fixture.whenStable();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('h1')?.textContent).toContain('Azaruddin A M');
    expect(el.textContent).toContain('ngx-upgrade-doctor');
    expect(el.textContent).toContain('draftkeeper');
    expect(el.textContent).toContain('Veloura Jewels');
    expect(el.querySelectorAll('.timeline-item').length).toBe(portfolio.experience.length);
  });

  it('shows an error message when the data cannot load', async () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    http.expectOne(STATIC_DATA_URL).flush('nope', { status: 500, statusText: 'Server Error' });
    await fixture.whenStable();
    expect(fixture.nativeElement.textContent).toContain("couldn't load");
  });
});
