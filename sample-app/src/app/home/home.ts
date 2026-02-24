// src/app/home/home.ts
import { Component, inject, NgZone, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';         // ← include Router
import { FormsModule } from '@angular/forms';
import { Api } from '../services/api';
import { ApiObject } from '../models/object.model';
import { pickSpecs, ViewSpec } from '../shared/specs.util';

type ViewItem = ApiObject & { specs: ViewSpec[] };

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './home.html',
  styleUrls: ['./home.css'],
})
export class Home {
  private apiService = inject(Api);
  private ngZone = inject(NgZone);
  private cdr = inject(ChangeDetectorRef);
  private router = inject(Router);                               // ← inject Router

  data: ViewItem[] = [];
  loading = true;
  error: string | null = null;

  // Template-driven search term
  searchTerm: string = '';

  // Show success message after actions like delete (navigated here with router state)
  successMessage: string | null = null;                          // ← add

  ngOnInit(): void {
    // Pick up success message from navigation state (works when navigating from detail page)
    // Fallback to history.state for cases like browser refresh.
    const nav = this.router.getCurrentNavigation();
    const state = (nav?.extras?.state as { successMessage?: string } | undefined) ?? (history.state as any);

    if (state?.successMessage) {
      this.successMessage = state.successMessage;
      // Optional: clear message after some time
      setTimeout(() => {
        this.successMessage = null;
        this.cdr.detectChanges();
      }, 4000);
    }

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