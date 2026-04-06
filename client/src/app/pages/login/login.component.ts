import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="login-wrapper">
      <div class="glass login-box">
        <h2>Admin Login</h2>
        <form (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label>Email</label>
            <input type="email" [(ngModel)]="email" name="email" required />
          </div>
          <div class="form-group">
            <label>Password</label>
            <input type="password" [(ngModel)]="password" name="password" required />
          </div>
          <button type="submit" class="btn-primary login-btn">Login</button>
          <div class="error" *ngIf="errorMsg">{{ errorMsg }}</div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .login-wrapper {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
      background: linear-gradient(135deg, var(--primary-color) 0%, #a5b4fc 100%);
    }
    .login-box {
      padding: 3rem;
      width: 100%;
      max-width: 400px;
      text-align: center;
      background: rgba(255, 255, 255, 0.9);
      color: #1f2937;
    }
    .login-box h2 {
      margin-bottom: 2rem;
      font-weight: 700;
    }
    .form-group {
      text-align: left;
      margin-bottom: 1.5rem;
    }
    .form-group label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 500;
      font-size: 0.875rem;
    }
    .form-group input {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid #d1d5db;
      border-radius: 6px;
      outline: none;
      transition: border-color 0.2s;
    }
    .form-group input:focus {
      border-color: var(--primary-color);
    }
    .login-btn {
      width: 100%;
      padding: 0.75rem;
      margin-top: 1rem;
    }
    .error {
      margin-top: 1rem;
      color: #ef4444;
      font-size: 0.875rem;
    }
  `]
})
export class LoginComponent {
  email = 'admin@dashboard.com';
  password = 'admin123';
  errorMsg = '';

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit() {
    this.authService.login({ email: this.email, password: this.password }).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: () => this.errorMsg = 'Invalid credentials'
    });
  }
}
