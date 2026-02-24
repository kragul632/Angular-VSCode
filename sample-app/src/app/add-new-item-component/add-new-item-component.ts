import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormArray, Validators, FormGroup } from '@angular/forms';
import { Api } from '../services/api';

@Component({
  selector: 'app-add-new-item',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './add-new-item-component.html',
})
export class AddNewItemComponent {
  submitting = false;
  error: string | null = null;

  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private api: Api,
    private router: Router
  ) {
    this.form = this.fb.group({
      name: ['', Validators.required],
      data: this.fb.array([]),
    });

    // Optional: start with two empty rows
    this.addRow();
    this.addRow();
  }

  get dataArray(): FormArray<FormGroup> {
    return this.form.get('data') as FormArray<FormGroup>;
  }

  addRow() {
    const row = this.fb.group({
      key: ['', Validators.required],
      value: ['', Validators.required],
    });
    this.dataArray.push(row);
  }

  removeRow(i: number) {
    this.dataArray.removeAt(i);
  }

  private buildDataObject(): Record<string, any> | undefined {
    const obj: Record<string, any> = {};
    this.dataArray.controls.forEach((row) => {
      const key = (row.get('key')?.value ?? '').toString().trim();
      const value = row.get('value')?.value;
      if (key && value !== undefined && value !== null && String(value).length > 0) {
        obj[key] = value;
      }
    });
    return Object.keys(obj).length ? obj : undefined;
  }

  submit() {
    this.error = null;

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const payload = {
      name: (this.form.get('name')?.value as string).trim(),
      data: this.buildDataObject(),
    };

    this.submitting = true;

    this.api.create(payload).subscribe({
      next: (res) => {
        this.submitting = false;
        if (res?.id) {
          this.router.navigate(['/items', res.id]);
        } else {
          this.router.navigate(['/']);
        }
      },
      error: () => {
        this.submitting = false;
        this.error = 'Failed to create item. Try again.';
      },
    });
  }

  cancel() {
    this.router.navigate(['/']);
  }
}