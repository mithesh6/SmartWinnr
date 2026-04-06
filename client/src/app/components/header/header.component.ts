import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { SearchService } from '../../services/search.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <header class="header">
      <div class="search-bar">
        <input type="text" placeholder="Search..." [(ngModel)]="searchTerm" (ngModelChange)="onSearchChange($event)" />
      </div>
      <div class="user-actions">
        <button class="theme-toggle" (click)="toggleTheme()">
          {{ isDark ? '☀️' : '🌙' }}
        </button>
        <div class="profile-pic">
          <img src="https://ui-avatars.com/api/?name=Admin+User&background=4f46e5&color=fff" alt="Profile" />
        </div>
      </div>
    </header>
  `,
  styles: [`
    .header {
      height: 80px;
      padding: 0 2rem;
      background: var(--header-bg);
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      border-bottom: var(--glass-border);
      display: flex;
      justify-content: space-between;
      align-items: center;
      position: sticky;
      top: 0;
      z-index: 10;
    }
    .search-bar input {
      padding: 0.6rem 1.2rem;
      border-radius: 20px;
      border: 1px solid var(--border-color);
      background: var(--bg-color);
      color: var(--text-color);
      outline: none;
      width: 300px;
      transition: all 0.3s;
    }
    .search-bar input:focus {
      border-color: var(--primary-color);
      width: 350px;
    }
    .user-actions {
      display: flex;
      align-items: center;
      gap: 1.5rem;
    }
    .theme-toggle {
      background: none;
      border: none;
      font-size: 1.5rem;
      cursor: pointer;
    }
    .profile-pic img {
      width: 40px;
      height: 40px;
      border-radius: 50%;
    }
  `]
})
export class HeaderComponent {
  isDark = false;
  searchTerm = '';

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private searchService: SearchService
  ) {
    if (isPlatformBrowser(this.platformId)) {
      const theme = localStorage.getItem('theme');
      if (theme === 'dark') {
        this.isDark = true;
        document.documentElement.setAttribute('data-theme', 'dark');
      }
    }
  }

  onSearchChange(term: string) {
    this.searchService.setSearch(term);
  }

  toggleTheme() {
    this.isDark = !this.isDark;
    if (isPlatformBrowser(this.platformId)) {
      if (this.isDark) {
        document.documentElement.setAttribute('data-theme', 'dark');
        localStorage.setItem('theme', 'dark');
      } else {
        document.documentElement.removeAttribute('data-theme');
        localStorage.setItem('theme', 'light');
      }
    }
  }
}
