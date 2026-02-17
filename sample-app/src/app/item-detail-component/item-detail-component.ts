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

    console.log('Fetching item id:', id);

    this.api.getbyId(id).subscribe({
      next: (res) => {
        this.ngZone.run(() => {
          this.item = res;
          this.itemSpecs = pickSpecs(res?.data); // 👈 curated whitelist
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

  goBack(): void {
    this.router.navigate(['/']);
  }
}