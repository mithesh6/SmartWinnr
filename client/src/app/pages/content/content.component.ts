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
  selector: 'app-content',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="content-header">
      <div class="header-main">
        <h2>Content Management</h2>
        <div class="filters-row">
          <select class="status-filter" [(ngModel)]="statusFilter" (change)="currentPage = 1">
            <option value="All">All Status</option>
            <option value="Draft">Draft</option>
            <option value="Published">Published</option>
            <option value="Archived">Archived</option>
          </select>
        </div>
      </div>
      <div class="header-actions">
        <div class="export-buttons">
          <button class="btn-outline" (click)="exportCSV()">CSV</button>
          <button class="btn-outline" (click)="exportPDF()">PDF</button>
        </div>
        <button class="btn-primary" (click)="openModal('add')">Create Content</button>
      </div>
    </div>
    
    <div class="glass table-container">
      <table class="data-table">
        <thead>
          <tr>
            <th>Title</th>
            <th>Author</th>
            <th>Status</th>
            <th>Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let item of pagedContent">
            <td class="font-medium">{{ item.title }}</td>
            <td>{{ item.author?.name || 'Admin' }}</td>
            <td><span class="status-badge" [ngClass]="item.status.toLowerCase()">{{ item.status }}</span></td>
            <td>{{ item.createdAt | date:'shortDate' }}</td>
            <td>
              <button class="action-btn edit" (click)="openModal('edit', item)">✏️</button>
              <button class="action-btn delete" (click)="deleteContent(item._id)">🗑️</button>
            </td>
          </tr>
          <tr *ngIf="filteredContent.length === 0">
            <td colspan="5" style="text-align: center; padding: 3rem;">No matching content found.</td>
          </tr>
        </tbody>
      </table>

      <!-- Pagination Footer -->
      <div class="pagination-footer">
        <span class="page-info">
          Showing {{ startItem + 1 }} to {{ endItem }} of {{ filteredContent.length }} entries
        </span>
        <div class="page-controls">
          <button class="page-btn" [disabled]="currentPage === 1" (click)="currentPage = currentPage - 1">Prev</button>
          <button class="page-btn active">{{ currentPage }}</button>
          <button class="page-btn" [disabled]="currentPage * pageSize >= filteredContent.length" (click)="currentPage = currentPage + 1">Next</button>
        </div>
      </div>
    </div>

    <!-- Modal for Add / Edit Content -->
    <div class="modal-overlay" *ngIf="isModalOpen">
      <div class="modal-content glass">
        <h3>{{ modalMode === 'add' ? 'Create New Content' : 'Edit Content' }}</h3>
        <form (ngSubmit)="saveContent()">
          <div class="form-group">
            <label>Title</label>
            <input type="text" class="form-control" [(ngModel)]="currentContent.title" name="title" required />
          </div>
          <div class="form-group">
            <label>Body Content</label>
            <textarea class="form-control text-area" [(ngModel)]="currentContent.body" name="body" required rows="5"></textarea>
          </div>
          <div class="form-group">
            <label>Status</label>
            <select class="form-control" [(ngModel)]="currentContent.status" name="status" required>
              <option value="Draft">Draft</option>
              <option value="Published">Published</option>
              <option value="Archived">Archived</option>
            </select>
          </div>
          <div class="modal-actions">
            <button type="button" class="btn-secondary" (click)="closeModal()">Cancel</button>
            <button type="submit" class="btn-primary">Save Content</button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .content-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
    .header-main { display: flex; flex-direction: column; gap: 0.75rem; }
    .header-actions { display: flex; gap: 1rem; }
    .status-filter { padding: 0.5rem; border-radius: 8px; border: 1px solid var(--border-color); background: var(--card-bg); color: var(--text-color); font-size: 0.875rem; outline: none; }
    
    .btn-outline { padding: 0.5rem 0.75rem; border: 1px solid var(--border-color); background: transparent; color: var(--text-color); border-radius: 6px; cursor: pointer; font-size: 0.75rem; font-weight: 600; transition: all 0.2s; }
    .btn-outline:hover { background: var(--primary-color); color: white; border-color: var(--primary-color); }

    .table-container { overflow-x: auto; }
    .data-table { width: 100%; border-collapse: collapse; text-align: left; }
    .data-table th, .data-table td { padding: 1rem 1.5rem; border-bottom: 1px solid var(--border-color); }
    .font-medium { font-weight: 500; }

    .status-badge { padding: 0.25rem 0.75rem; border-radius: 9999px; font-size: 0.75rem; font-weight: 500; }
    .status-badge.draft { background: #e5e7eb; color: #374151; }
    .status-badge.published { background: #d1fae5; color: #065f46; }
    .status-badge.archived { background: #fee2e2; color: #991b1b; }
    [data-theme='dark'] .status-badge.draft { background: #374151; color: #d1d5db; }
    [data-theme='dark'] .status-badge.published { background: #064e3b; color: #a7f3d0; }
    [data-theme='dark'] .status-badge.archived { background: #7f1d1d; color: #fecaca; }

    .pagination-footer { padding: 1rem 1.5rem; display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--border-color); }
    .page-controls { display: flex; gap: 0.25rem; }
    .page-btn { padding: 0.375rem 0.75rem; border: 1px solid var(--border-color); background: transparent; color: var(--text-color); border-radius: 4px; cursor: pointer; }
    .page-btn.active { background: var(--primary-color); color: white; border-color: var(--primary-color); }
    .text-area { font-family: inherit; }

    .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.6); backdrop-filter: blur(4px); display: flex; justify-content: center; align-items: center; z-index: 1000; }
    .modal-content { background: var(--sidebar-bg); padding: 2rem; border-radius: 1rem; width: 500px; border: var(--glass-border); }
    .form-group { margin-bottom: 1.25rem; }
    .form-group label { display: block; margin-bottom: 0.5rem; font-size: 0.875rem; font-weight: 500; }
    .form-control { width: 100%; padding: 0.75rem; border: 1px solid var(--border-color); border-radius: 8px; background: var(--bg-color); color: var(--text-color); }
    .modal-actions { display: flex; justify-content: flex-end; gap: 1rem; margin-top: 2rem; }
    .btn-secondary { padding: 0.5rem 1rem; border: 1px solid var(--border-color); background: transparent; color: var(--text-color); border-radius: 6px; cursor: pointer; }
  `]
})
export class ContentComponent implements OnInit {
  contents: any[] = [];
  searchTerm = '';
  statusFilter = 'All';
  currentPage = 1;
  pageSize = 5;

  isModalOpen = false;
  modalMode: 'add' | 'edit' = 'add';
  currentContent: any = { title: '', body: '', status: 'Draft' };

  constructor(private http: HttpClient, private searchService: SearchService) {
      effect(() => {
          this.searchTerm = this.searchService.searchTerm();
          this.currentPage = 1;
      });
  }

  ngOnInit() {
    this.loadContent();
  }

  getHeaders() {
    const token = localStorage.getItem('token');
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  loadContent() {
    this.http.get<any[]>(`${environment.apiUrl}/content`, { headers: this.getHeaders() }).subscribe(data => {
      this.contents = data;
    });
  }

  get filteredContent() {
    return this.contents.filter(c => {
      const matchesSearch = c.title.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchesStatus = this.statusFilter === 'All' || c.status === this.statusFilter;
      return matchesSearch && matchesStatus;
    });
  }

  get pagedContent() {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredContent.slice(start, start + this.pageSize);
  }

  get startItem() { return (this.currentPage - 1) * this.pageSize; }
  get endItem() { return Math.min(this.currentPage * this.pageSize, this.filteredContent.length); }

  exportCSV() {
    const headers = ['Title', 'Author', 'Status', 'Date'];
    const rows = this.filteredContent.map(c => [c.title, c.author?.name || 'Admin', c.status, c.createdAt]);
    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
    saveAs(blob, 'content-report.csv');
  }

  exportPDF() {
    const doc = new jsPDF();
    doc.text('Content Management Report', 14, 15);
    const body = this.filteredContent.map(c => [c.title, c.author?.name || 'Admin', c.status, new Date(c.createdAt).toLocaleDateString()]);
    autoTable(doc, { head: [['Title', 'Author', 'Status', 'Date']], body, startY: 20 });
    doc.save('content-report.pdf');
  }

  openModal(mode: 'add' | 'edit', item: any = null) {
    this.isModalOpen = true;
    this.modalMode = mode;
    this.currentContent = item ? { ...item } : { title: '', body: '', status: 'Draft' };
  }

  closeModal() { this.isModalOpen = false; }

  saveContent() {
    const req = this.modalMode === 'add'
      ? this.http.post(`${environment.apiUrl}/content`, this.currentContent, { headers: this.getHeaders() })
      : this.http.put(`${environment.apiUrl}/content/${this.currentContent._id}`, this.currentContent, { headers: this.getHeaders() });
    
    req.subscribe(() => { this.loadContent(); this.closeModal(); });
  }

  deleteContent(id: string) {
    if (confirm('Are you sure you want to delete this content?')) {
      this.http.delete(`${environment.apiUrl}/content/${id}`, { headers: this.getHeaders() }).subscribe(() => this.loadContent());
    }
  }
}
