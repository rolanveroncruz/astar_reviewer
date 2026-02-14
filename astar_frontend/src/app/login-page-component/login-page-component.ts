import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

import { AuthService } from '../../api_services/auth-service';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.scss'],
})
export class LoginPageComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);

  readonly loading = signal(false);
  readonly errorMsg = signal<string | null>(null);

  readonly form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
  });

  async loginEmail() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.errorMsg.set(null);

    const { email, password } = this.form.getRawValue();

    try {
      await this.auth.loginWithEmail(email!, password!);
      await this.router.navigateByUrl('/'); // change to your post-login route
    } catch (e: any) {
      this.errorMsg.set(this.prettyFirebaseError(e));
    } finally {
      this.loading.set(false);
    }
  }

  async loginGoogle() {
    this.loading.set(true);
    this.errorMsg.set(null);

    try {
      await this.auth.loginWithGoogle();
      await this.router.navigateByUrl('/');
    } catch (e: any) {
      this.errorMsg.set(this.prettyFirebaseError(e));
    } finally {
      this.loading.set(false);
    }
  }

  private prettyFirebaseError(e: any): string {
    const code = e?.code as string | undefined;

    switch (code) {
      case 'auth/invalid-credential':
      case 'auth/wrong-password':
        return 'Incorrect email or password.';
      case 'auth/user-not-found':
        return 'No account found for that email.';
      case 'auth/too-many-requests':
        return 'Too many attempts. Please try again later.';
      case 'auth/popup-closed-by-user':
        return 'Google sign-in was cancelled.';
      case 'auth/popup-blocked':
        return 'Popup was blocked by the browser. Allow popups and try again.';
      default:
        return e?.message ?? 'Login failed. Please try again.';
    }
  }
}
