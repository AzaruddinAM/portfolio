import { Component, inject, input, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ContactMessage } from './portfolio.model';
import { PortfolioService } from './portfolio.service';

type Status = 'idle' | 'sending' | 'sent' | 'mail' | 'error';

@Component({
  selector: 'app-contact-form',
  imports: [ReactiveFormsModule],
  template: `
    <form class="contact-form" [formGroup]="form" (ngSubmit)="submit()" novalidate>
      <label>
        <span>Name</span>
        <input formControlName="name" autocomplete="name" />
        @if (showError('name')) {
          <small class="field-error">Please enter your name.</small>
        }
      </label>
      <label>
        <span>Email</span>
        <input formControlName="email" type="email" autocomplete="email" />
        @if (showError('email')) {
          <small class="field-error">Please enter a valid email.</small>
        }
      </label>
      <label>
        <span>Message</span>
        <textarea formControlName="message" rows="5"></textarea>
        @if (showError('message')) {
          <small class="field-error">Please write at least 10 characters.</small>
        }
      </label>
      <button class="btn btn-primary" type="submit" [disabled]="status() === 'sending'">
        {{ status() === 'sending' ? 'Sending…' : 'Send message' }}
      </button>
      @switch (status()) {
        @case ('sent') {
          <p class="form-status ok" role="status">Thanks — your message is on its way.</p>
        }
        @case ('mail') {
          <p class="form-status ok" role="status">Your email app should open with the message ready to send.</p>
        }
        @case ('error') {
          <p class="form-status err" role="alert">
            Couldn't send right now. Please email
            <a [href]="'mailto:' + email()">{{ email() }}</a>.
          </p>
        }
      }
    </form>
  `,
})
export class ContactForm {
  readonly email = input.required<string>();

  private readonly service = inject(PortfolioService);
  protected readonly status = signal<Status>('idle');
  protected readonly form = inject(FormBuilder).nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(100)]],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(200)]],
    message: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(4000)]],
  });

  protected showError(field: keyof ContactMessage): boolean {
    const control = this.form.controls[field];
    return control.invalid && (control.touched || control.dirty);
  }

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const message = this.form.getRawValue();
    this.status.set('sending');
    this.service.sendMessage(message).subscribe({
      next: (sentByApi) => {
        if (!sentByApi) {
          this.openMailClient(message);
        }
        this.status.set(sentByApi ? 'sent' : 'mail');
        this.form.reset();
      },
      error: () => this.status.set('error'),
    });
  }

  private openMailClient({ name, email, message }: ContactMessage): void {
    const subject = encodeURIComponent(`Portfolio enquiry from ${name}`);
    const body = encodeURIComponent(`${message}\n\n— ${name} (${email})`);
    window.location.href = `mailto:${this.email()}?subject=${subject}&body=${body}`;
  }
}
