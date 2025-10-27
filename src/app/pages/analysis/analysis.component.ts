import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

interface Pato {
  id: number;
  cidade: string;
  pais: string;
}

@Component({
  selector: 'app-analysis',
  standalone: true,
  imports: [CommonModule, HttpClientModule, FormsModule],
  templateUrl: './analysis.component.html',
  styleUrls: ['./analysis.component.scss']
})
export class AnalysisComponent {
  private quackSound: HTMLAudioElement;
  patos: Pato[] = [];
  results: any[] = [];
  selectedPatoId: any = '';
  baseUrl = 'http://127.0.0.1:5000';
  detailVisible = false;
  detail: any = null;
  plan: any = null;

  constructor(private http: HttpClient, private router: Router) {
    this.quackSound = new Audio('quack.mp3');
    this.loadPatos();
  }

  playQuackSound(value: string): void {
    this.quackSound.currentTime = 0;
    this.quackSound.play().catch(() => {});
    setTimeout(() => {
      if (value === 'voltar') {
        this.router.navigate(['/']);
      }
    }, 450);
  }

  loadPatos(): void {
    this.http.get<any[]>(`${this.baseUrl}/patos`).subscribe({
      next: data => this.patos = data.map(d => ({ id: d.id, cidade: d.cidade, pais: d.pais })),
      error: () => this.patos = []
    });
  }

  runAnalysis(): void {
    if (!this.selectedPatoId) {
      this.runAllAnalysis();
      return;
    }
    this.http.get<any>(`${this.baseUrl}/analise/${this.selectedPatoId}`).subscribe({
      next: data => {
        const pato = this.patos.find(p => p.id === Number(this.selectedPatoId));
        this.results = [{ id: data.id, risco_est: data.risco_est, custo_operacional_est: data.custo_operacional_est, valor_cientifico_est: data.valor_cientifico_est, local: pato ? pato.cidade + ', ' + pato.pais : '' }];
      },
      error: () => this.results = []
    });
  }

  runAllAnalysis(): void {
    this.results = [];
    const calls = this.patos.map(p => p.id);
    let loaded = 0;
    for (const id of calls) {
      this.http.get<any>(`${this.baseUrl}/analise/${id}`).subscribe({
        next: data => {
          const pato = this.patos.find(x => x.id === id);
          this.results.push({ id: data.id, risco_est: data.risco_est, custo_operacional_est: data.custo_operacional_est, valor_cientifico_est: data.valor_cientifico_est, local: pato ? pato.cidade + ', ' + pato.pais : '' });
        },
        error: () => {},
        complete: () => {
          loaded++;
        }
      });
    }
  }

  openDetails(r: any): void {
    this.detailVisible = true;
    this.detail = r;
    this.http.get<any>(`${this.baseUrl}/plano/${r.id}`).subscribe({
      next: data => { this.plan = data; },
      error: () => { this.plan = null; }
    });
  }

  closeDetails(): void {
    this.detailVisible = false;
    this.detail = null;
    this.plan = null;
  }
}
