import { Routes } from '@angular/router';
import { Home } from './home/home';
import { ItemDetailComponent } from './item-detail-component/item-detail-component';
import { AddNewItemComponent } from './add-new-item-component/add-new-item-component';
import { ItemUpdateComponent } from './item-update-component/item-update-component';

export const routes: Routes = [
  { path: '', component: Home },

  // 👇 Static path FIRST so it doesn't get captured by :id
  { path: 'items/new', component: AddNewItemComponent },
  { path: 'items/:id/edit', component: ItemUpdateComponent },
  // 👇 Param route AFTER
  { path: 'items/:id', component: ItemDetailComponent },

  { path: '**', redirectTo: '' },
];