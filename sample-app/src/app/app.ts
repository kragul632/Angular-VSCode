
import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from './common/header/header';
import { Footer } from './common/footer/footer';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet,Header, Footer],
  templateUrl: './app.html',
  styleUrls: ['./app.css'],
})
export class App {
  protected readonly title = signal('sample-app');
}
