import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { take } from 'rxjs';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
})
export class AppSideLoginComponent {
  isSubmitting = false;
  serverError!: string;

  get username() {
    return this.loginForm.get('username');
  }

  get password() {
    return this.loginForm.get('password');
  }

  loginForm = this.fb.group({
    username: ['', [Validators.required]],
    password: ['', [Validators.required]],
  });

  constructor(private authService: AuthService,
    private router: Router,
    private fb: FormBuilder) { }

  login() {
    if (this.loginForm.invalid)
      return;

    this.isSubmitting = true;

    const username = this.username?.value;
    const password = this.password?.value;

    this.authService.login(username!, password!).pipe(take(1)).subscribe({
      next: (user) => {
        if (user) {
          this.router.navigate(['']);
        }
      },
      error: (err) => {
        this.serverError = err.message;
        this.isSubmitting = false;
      }
    });
  }
}
