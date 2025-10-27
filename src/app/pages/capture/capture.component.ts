import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';

interface Pato { id: number; cidade: string; pais: string; }

@Component({
  selector: 'app-capture',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './capture.component.html',
  styleUrls: ['./capture.component.scss']
})
export class CaptureComponent {
  private quackSound: HTMLAudioElement;
  patos: Pato[] = [];
  selectedPatoId: any = '';
  baseUrl = 'http://127.0.0.1:5000';
  plan: any = null;
  droneStatus: any = null;
  defense: any = null;

  constructor(private http: HttpClient, private router: Router) {
    this.quackSound = new Audio('quack.mp3');
    this.loadPatos();
  }

  playQuackSound(value: string): void {
    this.quackSound.currentTime = 0;
    this.quackSound.play().catch(() => {});
    setTimeout(() => { if (value === 'voltar') this.router.navigate(['/']); }, 450);
  }

  loadPatos(): void {
    const url = `${this.baseUrl}/patos`;
    console.log('loadPatos -> GET', url);
    this.http.get<any[]>(url).subscribe({
      next: data => {
        console.log('GET /patos success', data);
        if (!Array.isArray(data) || data.length === 0) {
          console.warn('GET /patos retornou vazio');
          this.patos = [];
          return;
        }
        this.patos = data.map(d => ({ id: d.id, cidade: d.cidade, pais: d.pais }));
      },
      error: err => {
        console.error('GET /patos error', err);
        this.patos = [];
      }
    });
  }

  requestPlan(): void {
    if (!this.selectedPatoId) return;
    const url = `${this.baseUrl}/plano/${this.selectedPatoId}`;
    console.log('requestPlan -> GET', url);
    this.http.get<any>(url).subscribe({
      next: data => { this.plan = data; console.log('GET /plano success', data); },
      error: err => { console.error('GET /plano error', err); this.plan = null; }
    });
  }

  getDroneStatus(): void {
    const url = `${this.baseUrl}/plano/status_drone`;
    this.http.get<any>(url).subscribe({
      next: data => { this.droneStatus = data; console.log('GET status_drone', data); },
      error: err => { console.error('GET status_drone error', err); this.droneStatus = null; }
    });
  }

  getRandomDefense(): void {
    const url = `${this.baseUrl}/plano/defesa_aleatoria`;
    this.http.get<any>(url).subscribe({
      next: data => { this.defense = data; console.log('GET defesa_aleatoria', data); },
      error: err => { console.error('GET defesa_aleatoria error', err); this.defense = { defesa: 'Nenhuma defesa disponível' }; }
    });
  }

  closeDefense(): void { this.defense = null; }
}
