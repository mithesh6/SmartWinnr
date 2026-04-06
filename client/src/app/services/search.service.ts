import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SearchService {
  searchTerm = signal('');

  setSearch(term: string) {
    this.searchTerm.set(term);
  }
}
