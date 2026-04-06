import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterModule, CommonModule],
  template: `
    <div class="sidebar">
      <div class="logo">
        <h2>SmartWinnr</h2>
      </div>
      <ul class="nav-links">
        <li><a routerLink="/dashboard" routerLinkActive="active"><span class="icon">📊</span> Dashboard</a></li>
        <li *ngIf="isAdminOrManager()"><a routerLink="/users" routerLinkActive="active"><span class="icon">👥</span> Users</a></li>
        <li><a routerLink="/content" routerLinkActive="active"><span class="icon">📄</span> Content</a></li>
        <li><a routerLink="/settings" routerLinkActive="active"><span class="icon">⚙️</span> Settings</a></li>
      </ul>
      <div class="logout">
        <button class="logout-btn" (click)="logout()">🚪 Logout</button>
      </div>
    </div>
  `,
  styles: [`
    .sidebar {
      width: 260px;
      height: 100vh;
      background: var(--sidebar-bg);
      border-right: var(--glass-border);
      display: flex;
      flex-direction: column;
      position: fixed;
      left: 0;
      top: 0;
    }
    .logo {
      padding: 2rem 1.5rem;
      border-bottom: 1px solid var(--border-color);
    }
    .nav-links {
      list-style: none;
      padding: 1rem 0;
      flex: 1;
    }
    .nav-links li a {
      display: flex;
      align-items: center;
      padding: 1rem 1.5rem;
      color: var(--text-color);
      text-decoration: none;
      font-weight: 500;
      transition: background 0.2s, color 0.2s;
    }
    .nav-links li a.active, .nav-links li a:hover {
      background: var(--primary-color);
      color: white;
    }
    .nav-links li a .icon {
      margin-right: 1rem;
      font-size: 1.25rem;
    }
    .logout {
      padding: 1.5rem;
      border-top: 1px solid var(--border-color);
    }
    .logout-btn {
      width: 100%;
      padding: 0.75rem;
      background: transparent;
      border: 1px solid var(--border-color);
      color: var(--text-color);
      border-radius: 6px;
      cursor: pointer;
      font-weight: 500;
      transition: all 0.2s;
    }
    .logout-btn:hover {
      background: #ef4444;
      color: white;
      border-color: #ef4444;
    }
  `]
})
export class SidebarComponent {
  userRole = '';
  
  constructor(private authService: AuthService) {
    const user = this.authService.currentUser();
    if (user) {
      this.userRole = user.role;
    }
  }

  isAdminOrManager() {
    return this.userRole === 'Admin' || this.userRole === 'Manager';
  }

  logout() {
    this.authService.logout();
  }
}
