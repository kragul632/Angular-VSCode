// src/app/item-detail-component/item-detail-component.ts

import { Component, inject, NgZone, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { Api } from '../services/api';
import { ApiObject } from '../models/object.model';
import { pickSpecs, ViewSpec } from '../shared/specs.util';

@Component({
  selector: 'app-item-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './item-detail-component.html',
  styleUrls: ['./item-detail-component.css'],
})
export class ItemDetailComponent {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private api = inject(Api);
  private ngZone = inject(NgZone);
  private cdr = inject(ChangeDetectorRef);

  loading = true;
  deleting = false;
  error: string | null = null;
  item: ApiObject | null = null;
  itemSpecs: ViewSpec[] = [];

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');

    if (!id) {
      this.error = 'Missing item id';
      this.loading = false;
      this.cdr.detectChanges();
      return;
    }

    this.api.getbyId(id).subscribe({
      next: (res) => {
        this.ngZone.run(() => {
          this.item = res;
          this.itemSpecs = pickSpecs(res?.data);
          this.loading = false;
          this.cdr.detectChanges();
        });
      },
      error: (err) => {
        console.error('Failed to load item', err);
        this.ngZone.run(() => {
          this.error = 'Failed to load item.';
          this.loading = false;
          this.cdr.detectChanges();
        });
      }
    });
  }

  /** Read-only IDs 1–13 */
  isReadOnlyId(id: string | number): boolean {
    const n = Number(id);
    return Number.isInteger(n) && n >= 1 && n <= 13;
  }

  deleteItem(id: string | number): void {
    if (this.isReadOnlyId(id)) {
      this.error = 'Demo items (IDs 1–13) cannot be deleted on the public API.';
      this.cdr.detectChanges();
      return;
    }

    const confirmed = window.confirm(
      'Are you sure you want to delete this item? This action cannot be undone.'
    );
    if (!confirmed) return;

    this.deleting = true;
    this.cdr.detectChanges();

    this.api.delete(id).subscribe({
      next: () => {
        this.router.navigate(['/'], {
          state: { successMessage: 'Item deleted successfully.' }
        });
      },
      error: (err) => {
        console.error('Failed to delete item', err);
        this.ngZone.run(() => {
          this.error = 'Failed to delete item.';
          this.deleting = false;
          this.cdr.detectChanges();
        });
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/']);
  }
}