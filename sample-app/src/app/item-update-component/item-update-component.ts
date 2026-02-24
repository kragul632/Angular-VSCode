// src/app/item-update-component/item-update-component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormArray,
  Validators,
  FormGroup,
} from '@angular/forms';
import { Api } from '../services/api';
import { ApiObject } from '../models/object.model';
import { ChangeDetectorRef, NgZone } from '@angular/core';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-item-update',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './item-update-component.html',
})
export class ItemUpdateComponent {
  form!: FormGroup;
  submitting = false;
  loading = true;
  error: string | null = null;
  id!: string;

  constructor(
    private fb: FormBuilder,
    private api: Api,
    private route: ActivatedRoute,
    private router: Router,
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef
  ) {
    this.form = this.fb.group({
      name: ['', Validators.required],
      data: this.fb.array([]),
    });
  }

  get nameCtrl() { return this.form.get('name'); }
  get dataArray(): FormArray { return this.form.get('data') as FormArray; }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.error = 'Missing item id';
      this.loading = false;
      return;
    }
    this.id = id;

    this.api.getbyId(id)
      .pipe(finalize(() => {
        this.ngZone.run(() => { this.loading = false; this.cdr.detectChanges(); });
      }))
      .subscribe({
        next: (res: ApiObject) => {
          this.ngZone.run(() => {
            this.nameCtrl?.setValue(res?.name ?? '');

            while (this.dataArray.length) this.dataArray.removeAt(0);

            const data: any = (res as any)?.data;
            if (data && typeof data === 'object' && !Array.isArray(data)) {
              Object.entries(data).forEach(([key, value]) => {
                this.dataArray.push(this.fb.group({
                  key: [key, Validators.required],
                  value: [String(value ?? ''), Validators.required],
                }));
              });
            } else {
              this.addRow();
            }

            this.cdr.detectChanges();
          });
        },
        error: (err: unknown) => {
          console.error('Failed to load item', err as any);
          this.ngZone.run(() => {
            this.error = 'Failed to load item.';
            this.cdr.detectChanges();
          });
        }
      });
  }

  addRow(): void {
    this.dataArray.push(this.fb.group({
      key: ['', Validators.required],
      value: ['', Validators.required],
    }));
  }

  removeRow(i: number): void {
    this.dataArray.removeAt(i);
    if (this.dataArray.length === 0) this.addRow();
  }

  private buildDataObject(): Record<string, any> | undefined {
    const obj: Record<string, any> = {};
    this.dataArray.controls.forEach(row => {
      const key = (row.get('key')?.value ?? '').toString().trim();
      const value = row.get('value')?.value;
      if (key.length > 0 && value !== undefined && value !== null && String(value).length > 0) {
        obj[key] = value;
      }
    });
    return Object.keys(obj).length ? obj : undefined;
  }

  submit(): void {
    this.error = null;

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const payload = {
      name: (this.nameCtrl?.value as string).trim(),
      data: this.buildDataObject(),
    };

    this.submitting = true;

    this.api.update(this.id, payload).subscribe({
      next: () => {
        this.submitting = false;
        this.router.navigate(['/items', this.id]);
      },
      error: (err: any) => {
        console.error('Update failed', err);
        this.submitting = false;

        if (err?.status === 405) {
          this.error = 'This item is read-only on the demo API and cannot be updated. Create a new item and update that one.';
        } else {
          this.error = 'Failed to update item. Please try again.';
        }
      },
    });
  }

  cancel(): void {
    this.router.navigate(['/items', this.id]);
  }
}