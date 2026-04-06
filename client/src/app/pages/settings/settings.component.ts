import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="settings-container">
      <h2 class="page-title">Settings & Profile</h2>
      
      <div class="grid-layout">
        <!-- Profile Card -->
        <div class="glass card profile-card">
          <div class="card-header">
            <h3>User Profile</h3>
            <p>Update your account information</p>
          </div>
          
          <form (ngSubmit)="updateProfile()" class="settings-form">
            <div class="form-group">
              <label>Full Name</label>
              <input type="text" class="form-control" [(ngModel)]="profile.name" name="name" required />
            </div>
            
            <div class="form-group">
              <label>Email Address</label>
              <input type="email" class="form-control" [(ngModel)]="profile.email" name="email" required />
            </div>

            <div class="form-group">
              <label>Role</label>
              <input type="text" class="form-control readonly" [value]="profile.role" disabled />
              <small>Contact an administrator to change your role.</small>
            </div>

            <div class="form-group">
              <label>New Password (leave blank to keep current)</label>
              <input type="password" class="form-control" [(ngModel)]="profile.password" name="password" placeholder="******" />
            </div>

            <div class="form-actions">
              <button type="submit" class="btn-primary" [disabled]="loading">
                {{ loading ? 'Saving...' : 'Update Profile' }}
              </button>
            </div>
          </form>
        </div>

        <!-- Preferences Card -->
        <div class="glass card preferences-card">
          <div class="card-header">
            <h3>Preferences</h3>
            <p>Customize your dashboard experience</p>
          </div>

          <div class="preferences-list">
            <div class="preference-item">
              <div class="item-info">
                <h4>Appearance</h4>
                <p>Switch between light and dark modes</p>
              </div>
              <div class="toggle-container">
                <button class="theme-toggle" (click)="toggleTheme()">
                  {{ isDarkMode ? '🌙 Dark Mode' : '☀️ Light Mode' }}
                </button>
              </div>
            </div>

            <div class="preference-item">
              <div class="item-info">
                <h4>Notifications</h4>
                <p>Enable real-time dashboard alerts</p>
              </div>
              <div class="toggle-container">
                <input type="checkbox" id="notify-toggle" class="custom-toggle" checked />
                <label for="notify-toggle" class="toggle-label"></label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .settings-container {
      max-width: 1000px;
      margin: 0 auto;
    }
    .page-title {
      margin-bottom: 2rem;
      font-size: 1.875rem;
      font-weight: 700;
    }
    .grid-layout {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
      gap: 2rem;
    }
    .card {
      padding: 2rem;
    }
    .card-header {
      margin-bottom: 2rem;
    }
    .card-header h3 {
      font-size: 1.25rem;
      font-weight: 600;
      margin-bottom: 0.25rem;
    }
    .card-header p {
      color: #6b7280;
      font-size: 0.875rem;
    }
    
    .form-group {
      margin-bottom: 1.5rem;
    }
    .form-group label {
      display: block;
      margin-bottom: 0.5rem;
      font-size: 0.875rem;
      font-weight: 500;
      color: #374151;
    }
    [data-theme='dark'] .form-group label {
      color: #d1d5db;
    }
    
    .form-control {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid var(--border-color);
      border-radius: 8px;
      background: var(--bg-color);
      color: var(--text-color);
      font-size: 0.875rem;
      transition: all 0.2s ease;
    }
    .form-control:focus {
      outline: none;
      border-color: var(--primary-color);
      box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
    }
    .readonly {
      background: rgba(0, 0, 0, 0.05);
      cursor: not-allowed;
    }
    [data-theme='dark'] .readonly {
      background: rgba(255, 255, 255, 0.05);
    }
    
    .form-actions {
      margin-top: 2rem;
    }
    
    /* Preferences */
    .preference-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.5rem 0;
      border-bottom: 1px solid var(--border-color);
    }
    .preference-item:last-child {
      border-bottom: none;
    }
    .item-info h4 {
      font-size: 1rem;
      font-weight: 600;
      margin-bottom: 0.25rem;
    }
    .item-info p {
      font-size: 0.875rem;
      color: #6b7280;
    }
    
    .theme-toggle {
      padding: 0.5rem 1rem;
      border-radius: 9999px;
      border: 1px solid var(--border-color);
      background: var(--card-bg);
      color: var(--text-color);
      cursor: pointer;
      font-weight: 500;
      transition: all 0.2s ease;
    }
    .theme-toggle:hover {
      background: var(--primary-color);
      color: white;
      border-color: var(--primary-color);
    }

    /* Simple toggle switch */
    .custom-toggle {
      display: none;
    }
    .toggle-label {
      cursor: pointer;
      width: 48px;
      height: 24px;
      background: #d1d5db;
      display: block;
      border-radius: 100px;
      position: relative;
      transition: background 0.3s ease;
    }
    .toggle-label::after {
      content: '';
      position: absolute;
      top: 2px;
      left: 2px;
      width: 20px;
      height: 20px;
      background: white;
      border-radius: 90px;
      transition: transform 0.3s ease;
    }
    .custom-toggle:checked + .toggle-label {
      background: var(--primary-color);
    }
    .custom-toggle:checked + .toggle-label::after {
      transform: translateX(24px);
    }
  `]
})
export class SettingsComponent implements OnInit {
  profile: any = { name: '', email: '', role: '', password: '' };
  loading = false;
  isDarkMode = false;

  constructor(private http: HttpClient, private authService: AuthService) {}

  ngOnInit() {
    const user = this.authService.currentUser();
    if (user) {
      this.profile = { ...user, password: '' };
    }
    this.isDarkMode = document.documentElement.getAttribute('data-theme') === 'dark';
  }

  getHeaders() {
    const token = localStorage.getItem('token');
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  toggleTheme() {
    this.isDarkMode = !this.isDarkMode;
    const theme = this.isDarkMode ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }

  updateProfile() {
    this.loading = true;
    this.http.put(`${environment.apiUrl}/auth/users/${this.profile.id || this.profile._id}`, this.profile, { headers: this.getHeaders() })
      .subscribe({
        next: (res: any) => {
          this.loading = false;
          alert('Profile updated successfully!');
          // Optionally update global auth state
        },
        error: (err) => {
          this.loading = false;
          alert('Error updating profile: ' + (err.error?.message || err.message));
        }
      });
  }
}
