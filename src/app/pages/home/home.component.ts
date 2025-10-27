import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { delay } from 'rxjs';

@Component({
  selector: 'app-home',
  imports: [],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {
  private quackSound: HTMLAudioElement;

  constructor(private router: Router) {
    this.quackSound = new Audio('quack.mp3');
  }

  playQuackSound(value: string): void {
    this.quackSound.currentTime = 0;
    this.quackSound.play().catch((error) => {
      console.log('Erro ao reproduzir som:', error);
    });
    delay(500);
    switch (value) {
      case 'catalog':
        this.router.navigate(['/catalog']);
        break;
      case 'analysis':
        this.router.navigate(['/analysis']);
        break;
      case 'capture':
        this.router.navigate(['/capture']);
        break;
    }
  }
}
