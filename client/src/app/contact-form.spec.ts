import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { ContactForm } from './contact-form';
import { PortfolioService } from './portfolio.service';

describe('ContactForm', () => {
  const sendMessage = vi.fn();

  beforeEach(async () => {
    sendMessage.mockReset();
    await TestBed.configureTestingModule({
      imports: [ContactForm],
      providers: [{ provide: PortfolioService, useValue: { sendMessage } }],
    }).compileComponents();
  });

  function create() {
    const fixture = TestBed.createComponent(ContactForm);
    fixture.componentRef.setInput('email', 'me@example.com');
    fixture.detectChanges();
    return fixture;
  }

  function fill(el: HTMLElement, name: string, value: string) {
    const input = el.querySelector(`[formControlName="${name}"]`) as HTMLInputElement;
    input.value = value;
    input.dispatchEvent(new Event('input'));
  }

  it('does not send an invalid form and shows errors', () => {
    const fixture = create();
    const el = fixture.nativeElement as HTMLElement;
    el.querySelector('form')!.dispatchEvent(new Event('submit'));
    fixture.detectChanges();
    expect(sendMessage).not.toHaveBeenCalled();
    expect(el.querySelectorAll('.field-error').length).toBe(3);
  });

  it('sends a valid message through the service', () => {
    sendMessage.mockReturnValue(of(true));
    const fixture = create();
    const el = fixture.nativeElement as HTMLElement;
    fill(el, 'name', 'Asha');
    fill(el, 'email', 'asha@example.com');
    fill(el, 'message', 'Would love to talk about a role.');
    el.querySelector('form')!.dispatchEvent(new Event('submit'));
    fixture.detectChanges();
    expect(sendMessage).toHaveBeenCalledWith({
      name: 'Asha',
      email: 'asha@example.com',
      message: 'Would love to talk about a role.',
    });
    expect(el.textContent).toContain('on its way');
  });
});
