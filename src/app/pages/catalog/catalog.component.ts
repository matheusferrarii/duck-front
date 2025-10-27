import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';

interface Drone {
  id: number;
  serial: string;
  marca?: string;
  fabricante?: string;
  pais_origem?: string;
}

interface Pato {
  id: number;
  drone_id: number;
  altura_cm: number;
  peso_g: number;
  cidade: string;
  pais: string;
  latitude: number;
  longitude: number;
  precisao_m: number;
  ponto_referencia?: string;
  status: string;
  batimentos_bpm?: number;
  mutacoes: number;
  poderes?: any[];
}

@Component({
  selector: 'app-catalog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HttpClientModule],
  templateUrl: './catalog.component.html',
  styleUrls: ['./catalog.component.scss']
})
export class CatalogComponent {
  private quackSound: HTMLAudioElement;
  drones: Drone[] = [];
  patos: Pato[] = [];
  powerVisible = false;
  selectedPato: Pato | null = null;
  baseUrl = 'http://127.0.0.1:5000';
  droneForm: FormGroup;
  patoForm: FormGroup;
  powerForm: FormGroup;

  constructor(private router: Router, private fb: FormBuilder, private http: HttpClient) {
    this.quackSound = new Audio('quack.mp3');
    this.baseUrl = 'http://127.0.0.1:5000';
    this.droneForm = this.fb.group({
      serial: ['', Validators.required],
      marca: [''],
      fabricante: [''],
      pais_origem: ['']
    });

    this.patoForm = this.fb.group({
      drone_id: ['', Validators.required],
      altura_value: ['', Validators.required],
      altura_unit: ['cm', Validators.required],
      peso_value: ['', Validators.required],
      peso_unit: ['g', Validators.required],
      cidade: ['', Validators.required],
      pais: ['', Validators.required],
      latitude: ['', Validators.required],
      longitude: ['', Validators.required],
      precisao_value: ['', Validators.required],
      precisao_unit: ['m', Validators.required],
      status: ['', Validators.required],
      batimentos: [''],
      mutacoes: ['', Validators.required]
    });

    this.powerForm = this.fb.group({
      nome: ['', Validators.required],
      descricao: ['', Validators.required],
      classificacao: ['', Validators.required]
    });

    this.loadDrones();
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

  loadDrones(): void {
    this.http.get<Drone[]>(`${this.baseUrl}/drones`).subscribe({
      next: data => this.drones = data,
      error: () => this.drones = []
    });
  }

  loadPatos(): void {
    this.http.get<Pato[]>(`${this.baseUrl}/patos`).subscribe({
      next: data => this.patos = data,
      error: () => this.patos = []
    });
  }

  createDrone(): void {
    if (this.droneForm.invalid) return;
    const payload = this.droneForm.value;
    this.http.post<any>(`${this.baseUrl}/drones`, payload).subscribe({
      next: () => {
        this.droneForm.reset();
        this.loadDrones();
      }
    });
  }

  createPato(): void {
    if (this.patoForm.invalid) return;
    const v = this.patoForm.value;
    const altura = { value: Number(v.altura_value), unit: v.altura_unit };
    const peso = { value: Number(v.peso_value), unit: v.peso_unit };
    const precisao = { value: Number(v.precisao_value), unit: v.precisao_unit };
    const payload = {
      drone_id: Number(v.drone_id),
      altura,
      peso,
      cidade: v.cidade,
      pais: v.pais,
      latitude: Number(v.latitude),
      longitude: Number(v.longitude),
      precisao,
      ponto_referencia: null,
      status: v.status,
      batimentos: v.batimentos ? Number(v.batimentos) : null,
      mutacoes: Number(v.mutacoes)
    };
    this.http.post<any>(`${this.baseUrl}/patos`, payload).subscribe({
      next: () => {
        this.resetPatoForm();
        this.loadPatos();
      }
    });
  }

  resetPatoForm(): void {
    this.patoForm.reset({
      drone_id: '',
      altura_value: '',
      altura_unit: 'cm',
      peso_value: '',
      peso_unit: 'g',
      cidade: '',
      pais: '',
      latitude: '',
      longitude: '',
      precisao_value: '',
      precisao_unit: 'm',
      status: '',
      batimentos: '',
      mutacoes: ''
    });
  }

  fillDroneForm(d: Drone): void {
    this.droneForm.patchValue({
      serial: d.serial,
      marca: d.marca,
      fabricante: d.fabricante,
      pais_origem: d.pais_origem
    });
  }

  openPowerForm(p: Pato): void {
    this.selectedPato = p;
    this.powerVisible = true;
    this.powerForm.reset();
  }

  closePowerForm(): void {
    this.selectedPato = null;
    this.powerVisible = false;
  }

  addPower(): void {
    if (!this.selectedPato) return;
    if (this.powerForm.invalid) return;
    const payload = this.powerForm.value;
    this.http.post<any>(`${this.baseUrl}/patos/${this.selectedPato.id}/poder`, payload).subscribe({
      next: () => {
        this.closePowerForm();
        this.loadPatos();
      },
      error: () => {}
    });
  }

  deletePato(id: number): void {
    this.http.delete<any>(`${this.baseUrl}/patos/${id}`).subscribe({
      next: () => this.loadPatos()
    });
  }
}
