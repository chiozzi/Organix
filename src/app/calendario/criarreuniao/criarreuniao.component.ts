import { HttpClient } from '@angular/common/http';
import { Component, EventEmitter, Input, Output } from '@angular/core';

interface Evento {
  id?: number;
  data: string;
  titulo: string;
  descricao: string;
  horario: string;
}

@Component({
  selector: 'app-criarreuniao',
  standalone: false,
  templateUrl: './criarreuniao.component.html',
  styleUrl: './criarreuniao.component.css'
})
export class CriarreuniaoComponent {
  @Input() evento!: Omit<Evento, 'id'>;
  @Output() salvar = new EventEmitter<Omit<Evento, 'id'>>();
  @Output() fechar = new EventEmitter<void>();

  salvarEvento() {
    if (this.evento.titulo && this.evento.descricao && this.evento.horario) {
      this.salvar.emit(this.evento);
    }
  }

  fecharModal() {
    this.fechar.emit();
  }
}

