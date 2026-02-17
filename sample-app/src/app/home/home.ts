import { Component, inject, NgZone, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';                    // ← add
import { Api } from '../services/api';
import { ApiObject } from '../models/object.model';
import { pickSpecs, ViewSpec } from '../shared/specs.util';

type ViewItem = ApiObject & { specs: ViewSpec[] };

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],            // ← add FormsModule
  templateUrl: './home.html',
  styleUrls: ['./home.css'],
})
export class Home {
  private apiService = inject(Api);
  private ngZone = inject(NgZone);
  private cdr = inject(ChangeDetectorRef);

  data: ViewItem[] = [];
  loading = true;
  error: string | null = null;

  // Template-driven search term
  searchTerm: string = '';

  ngOnInit(): void {
    this.apiService.getAll().subscribe({
      next: (res) => {
        this.ngZone.run(() => {
          this.data = res.map(item => ({
            ...item,
            specs: pickSpecs(item.data), // curated whitelist → consistent fields
          }));
          this.loading = false;
          this.cdr.detectChanges();
          console.log('Home fetched items:', this.data.length);
        });
      },
      error: (err) => {
        console.error('Error fetching data:', err);
        this.ngZone.run(() => {
          this.error = 'Failed to fetch items.';
          this.loading = false;
          this.cdr.detectChanges();
        });
      }
    });
  }

  /** Filtered list derived from data and searchTerm (case-insensitive) */
  get filtered(): ViewItem[] {
    const q = (this.searchTerm || '').trim().toLowerCase();
    if (!q) return this.data;

    return this.data.filter(item => {
      const inName = (item.name || '').toLowerCase().includes(q);
      const inSpecs = (item.specs || []).some(s =>
        (s.label || '').toLowerCase().includes(q) ||
        (s.value || '').toLowerCase().includes(q)
      );
      return inName || inSpecs;
    });
  }

  trackById = (_: number, item: ViewItem) => item?.id ?? _;
}
