import { Component, OnInit, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { FormsModule } from '@angular/forms';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { SearchService } from '../../services/search.service';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="users-header">
      <div class="header-main">
        <h2>User Management</h2>
      </div>
      <div class="header-actions">
        <div class="export-buttons">
          <button class="btn-outline" (click)="exportCSV()" title="Export to CSV">CSV</button>
          <button class="btn-outline" (click)="exportPDF()" title="Export to PDF">PDF</button>
        </div>
        <button class="btn-primary" (click)="openModal('add')">Add New User</button>
      </div>
    </div>
    
    <div class="glass table-container">
      <table class="data-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let user of pagedUsers">
            <td>
              <div class="user-info">
                <div class="avatar">{{ user.name?.charAt(0) }}</div>
                <span>{{ user.name }}</span>
              </div>
            </td>
            <td>{{ user.email }}</td>
            <td><span class="role-badge" [ngClass]="user.role.toLowerCase()">{{ user.role }}</span></td>
            <td><span class="status-dot"></span> Active</td>
            <td>
              <button class="action-btn edit" (click)="openModal('edit', user)">✏️</button>
              <button class="action-btn delete" (click)="deleteUser(user._id)">🗑️</button>
            </td>
          </tr>
          <tr *ngIf="filteredUsers.length === 0">
              <td colspan="5" class="empty-state">No users found.</td>
          </tr>
        </tbody>
      </table>

      <!-- Pagination Footer -->
      <div class="pagination-footer">
        <span class="page-info">
          Showing {{ startItem + 1 }} to {{ endItem }} of {{ filteredUsers.length }} users
        </span>
        <div class="page-controls">
          <button class="page-btn" [disabled]="currentPage === 1" (click)="goToPage(currentPage - 1)">Prev</button>
          <button class="page-btn active">{{ currentPage }}</button>
          <button class="page-btn" [disabled]="currentPage * pageSize >= filteredUsers.length" (click)="goToPage(currentPage + 1)">Next</button>
        </div>
      </div>
    </div>

    <!-- Modal for Add / Edit User -->
    <div class="modal-overlay" *ngIf="isModalOpen">
      <!-- ... same modal content ... -->
      <div class="modal-content glass">
        <h3>{{ modalMode === 'add' ? 'Add New User' : 'Edit User' }}</h3>
        <form (ngSubmit)="saveUser()">
          <div class="form-group">
            <label>Name</label>
            <input type="text" class="form-control" [(ngModel)]="currentUser.name" name="name" required />
          </div>
          <div class="form-group">
            <label>Email</label>
            <input type="email" class="form-control" [(ngModel)]="currentUser.email" name="email" required />
          </div>
          <div class="form-group">
            <label>Role</label>
            <select class="form-control" [(ngModel)]="currentUser.role" name="role" required>
              <option value="Viewer">Viewer</option>
              <option value="Manager">Manager</option>
              <option value="Admin">Admin</option>
            </select>
          </div>
          <div class="form-group">
            <label>Password {{ modalMode === 'edit' ? '(leave blank to keep current)' : '' }}</label>
            <input type="password" class="form-control" [(ngModel)]="currentUser.password" name="password" [required]="modalMode === 'add'" />
          </div>
          <div class="modal-actions">
            <button type="button" class="btn-secondary" (click)="closeModal()">Cancel</button>
            <button type="submit" class="btn-primary">Save User</button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .users-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; gap: 1rem; }
    .header-actions { display: flex; align-items: center; gap: 1rem; }
    .export-buttons { display: flex; gap: 0.5rem; }
    .btn-outline { padding: 0.5rem 0.75rem; border: 1px solid var(--border-color); background: transparent; color: var(--text-color); border-radius: 6px; cursor: pointer; font-size: 0.75rem; font-weight: 600; transition: all 0.2s; }
    .btn-outline:hover { background: var(--primary-color); color: white; border-color: var(--primary-color); }

    .table-container { overflow-x: auto; }
    .data-table { width: 100%; border-collapse: collapse; text-align: left; }
    .data-table th, .data-table td { padding: 1rem 1.5rem; border-bottom: 1px solid var(--border-color); }
    .data-table th { font-weight: 600; color: #6b7280; text-transform: uppercase; font-size: 0.75rem; letter-spacing: 0.05em; }
    
    .user-info { display: flex; align-items: center; gap: 1rem; font-weight: 500; }
    .avatar { width: 32px; height: 32px; border-radius: 50%; background: var(--primary-color); color: white; display: flex; justify-content: center; align-items: center; font-size: 0.875rem; }
    
    .role-badge { padding: 0.25rem 0.75rem; border-radius: 9999px; font-size: 0.75rem; font-weight: 500; }
    .role-badge.admin { background: #fee2e2; color: #991b1b; }
    .role-badge.manager { background: #fef3c7; color: #92400e; }
    .role-badge.viewer { background: #e0e7ff; color: #3730a3; }
    [data-theme='dark'] .role-badge.admin { background: #7f1d1d; color: #fecaca; }
    [data-theme='dark'] .role-badge.manager { background: #78350f; color: #fde68a; }
    [data-theme='dark'] .role-badge.viewer { background: #312e81; color: #c7d2fe; }

    .status-dot { display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: #10b981; margin-right: 0.5rem; }
    .action-btn { background: none; border: none; cursor: pointer; margin-right: 0.5rem; opacity: 0.7; font-size: 1.1rem; }
    .action-btn:hover { opacity: 1; }

    .empty-state { text-align: center; padding: 3rem; color: #6b7280; }
    .pagination-footer { padding: 1rem 1.5rem; display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--border-color); }
    .page-info { font-size: 0.875rem; color: #6b7280; }
    .page-controls { display: flex; gap: 0.25rem; }
    .page-btn { padding: 0.375rem 0.75rem; border: 1px solid var(--border-color); background: transparent; color: var(--text-color); border-radius: 4px; font-size: 0.875rem; cursor: pointer; }
    .page-btn.active { background: var(--primary-color); color: white; border-color: var(--primary-color); }
    .page-btn:disabled { opacity: 0.5; cursor: not-allowed; }

    .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0, 0, 0, 0.6); backdrop-filter: blur(4px); display: flex; justify-content: center; align-items: center; z-index: 1000; }
    .modal-content { background: var(--sidebar-bg); padding: 2.5rem; border-radius: 1rem; width: 450px; border: var(--glass-border); }
    .form-group { margin-bottom: 1.25rem; }
    .form-group label { display: block; margin-bottom: 0.5rem; font-weight: 500; font-size: 0.875rem; }
    .form-control { width: 100%; padding: 0.75rem; border: 1px solid var(--border-color); border-radius: 8px; background: var(--bg-color); color: var(--text-color); }
    .modal-actions { display: flex; justify-content: flex-end; gap: 1rem; margin-top: 2rem; }
    .btn-secondary { padding: 0.5rem 1rem; border: 1px solid var(--border-color); background: transparent; color: var(--text-color); border-radius: 6px; cursor: pointer; }
  `]
})
export class UsersComponent implements OnInit {
  users: any[] = [];
  searchTerm = '';
  currentPage = 1;
  pageSize = 5;

  isModalOpen = false;
  modalMode: 'add' | 'edit' = 'add';
  currentUser: any = { name: '', email: '', role: 'Viewer', password: '' };

  constructor(private http: HttpClient, private searchService: SearchService) {
    // Listen for global search changes
    effect(() => {
        this.searchTerm = this.searchService.searchTerm();
        this.currentPage = 1; // Reset to page 1 on search
    });
  }

  ngOnInit() {
    this.loadUsers();
  }

  getHeaders() {
    const token = localStorage.getItem('token');
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  loadUsers() {
    this.http.get<any[]>(`${environment.apiUrl}/auth/users`, { headers: this.getHeaders() }).subscribe(data => {
      this.users = data;
    });
  }

  get filteredUsers() {
    const term = this.searchTerm.toLowerCase();
    return this.users.filter(u => 
      u.name.toLowerCase().includes(term) || 
      u.email.toLowerCase().includes(term)
    );
  }

  get pagedUsers() {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredUsers.slice(start, start + this.pageSize);
  }

  get startItem() { return (this.currentPage - 1) * this.pageSize; }
  get endItem() { return Math.min(this.currentPage * this.pageSize, this.filteredUsers.length); }

  goToPage(p: number) { this.currentPage = p; }

  exportCSV() {
    const headers = ['ID', 'Name', 'Email', 'Role'];
    const rows = this.filteredUsers.map(u => [u._id, u.name, u.email, u.role]);
    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, 'users-report.csv');
  }

  exportPDF() {
    const doc = new jsPDF();
    doc.text('User Management Report', 14, 15);
    const body = this.filteredUsers.map(u => [u.name, u.email, u.role, 'Active']);
    autoTable(doc, { head: [['Name', 'Email', 'Role', 'Status']], body, startY: 20 });
    doc.save('users-report.pdf');
  }

  openModal(mode: 'add' | 'edit', user: any = null) {
    this.isModalOpen = true;
    this.modalMode = mode;
    this.currentUser = user ? { ...user, password: '' } : { name: '', email: '', role: 'Viewer', password: '' };
  }

  closeModal() { this.isModalOpen = false; }

  saveUser() {
    const req = this.modalMode === 'add' 
      ? this.http.post(`${environment.apiUrl}/auth/users`, this.currentUser, { headers: this.getHeaders() })
      : this.http.put(`${environment.apiUrl}/auth/users/${this.currentUser._id}`, this.currentUser, { headers: this.getHeaders() });
    
    req.subscribe(() => {
      this.loadUsers();
      this.closeModal();
    });
  }

  deleteUser(id: string) {
    if (confirm('Are you sure you want to delete this user?')) {
      this.http.delete(`${environment.apiUrl}/auth/users/${id}`, { headers: this.getHeaders() }).subscribe(() => this.loadUsers());
    }
  }
}
