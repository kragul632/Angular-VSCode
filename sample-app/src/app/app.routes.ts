import { Routes } from '@angular/router';
import { Home } from './home/home';
import { ItemDetailComponent } from './item-detail-component/item-detail-component';

export const routes: Routes = [
    {path: "", component:Home},
    { path:'items/:id',component: ItemDetailComponent}
];
