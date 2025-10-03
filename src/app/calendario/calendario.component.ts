import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

interface Evento {
  id: number;
  data: string;
  titulo: string;
  descricao: string;
  horario: string;
}

@Component({
  selector: 'app-calendario',
  standalone: false,
  templateUrl: './calendario.component.html',
  styleUrl: './calendario.component.css'
})
export class CalendarioComponent implements OnInit {
  hoje = new Date();
  anoAtual = this.hoje.getFullYear();
  mesAtual = this.hoje.getMonth();
  diasMes: number[] = [];
  diasSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  mostrarModalMeses = false;

  meses = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  diaSelecionado: number | null = null;
  diaSelecionadoFormatado: string = '';
  eventosDoDia: Evento[] = [];

  mostrarModalAdicionar = false;
  novoEvento: Omit<Evento, 'id'> = { data: '', titulo: '', descricao: '', horario: '' };

  eventos: Evento[] = [];
  
  private apiUrl = 'http://localhost:3000/eventos';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.carregarEventos();
  }

  carregarEventos() {
    this.http.get<Evento[]>(this.apiUrl).subscribe(data => {
      this.eventos = data;
      this.gerarCalendario();
      if (this.mesAtual === this.hoje.getMonth() && this.anoAtual === this.hoje.getFullYear()) {
        this.selecionarDia(this.hoje.getDate());
      }
    });
  }

  gerarCalendario() {
    this.diasMes = [];

    const primeiroDiaSemana = new Date(this.anoAtual, this.mesAtual, 1).getDay();
    const ultimoDia = new Date(this.anoAtual, this.mesAtual + 1, 0).getDate();

    for (let i = 0; i < primeiroDiaSemana; i++) {
      this.diasMes.push(0);
    }

    for (let d = 1; d <= ultimoDia; d++) {
      this.diasMes.push(d);
    }
  }

  mudarMes(direcao: number) {
    this.mesAtual += direcao;
    if (this.mesAtual < 0) {
      this.mesAtual = 11;
      this.anoAtual--;
    } else if (this.mesAtual > 11) {
      this.mesAtual = 0;
      this.anoAtual++;
    }
    this.gerarCalendario();
    this.diaSelecionado = null;
    this.eventosDoDia = [];
  }

  selecionarMes(m: number) {
    this.mesAtual = m;
    this.mostrarModalMeses = false;
    this.gerarCalendario();
    this.diaSelecionado = null;
    this.eventosDoDia = [];
  }

  ehHoje(dia: number) {
    return (
      dia === this.hoje.getDate() &&
      this.mesAtual === this.hoje.getMonth() &&
      this.anoAtual === this.hoje.getFullYear()
    );
  }

  temEvento(dia: number): boolean {
    if (dia === 0) return false;
    const dataFormatada = this.formatarData(dia);
    return this.eventos.some(evento => evento.data === dataFormatada);
  }

  selecionarDia(dia: number) {
    if (dia === 0) {
      this.diaSelecionado = null;
      this.eventosDoDia = [];
      return;
    }
    
    this.diaSelecionado = dia;
    
    const dataObj = new Date(this.anoAtual, this.mesAtual, dia);
    const opcoesFormato: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    this.diaSelecionadoFormatado = dataObj.toLocaleDateString('pt-BR', opcoesFormato);

    const dataFormatada = this.formatarData(dia);
    this.eventosDoDia = this.eventos.filter(evento => evento.data === dataFormatada);
  }

  abrirModalAdicionar() {
    if (this.diaSelecionado) {
      this.novoEvento = { data: this.formatarData(this.diaSelecionado), titulo: '', descricao: '', horario: '' };
      this.mostrarModalAdicionar = true;
    }
  }

  fecharModalAdicionar() {
    this.mostrarModalAdicionar = false;
  }

  salvarEvento() {
    if (this.novoEvento.titulo && this.novoEvento.descricao && this.novoEvento.horario) {
      this.http.post<Evento>(this.apiUrl, this.novoEvento).subscribe(eventoSalvo => {
        this.eventos.push(eventoSalvo);
        this.selecionarDia(this.diaSelecionado!);
        this.fecharModalAdicionar();
      });
    }
  }

  excluirEvento(id: number) {
    if (confirm('Tem certeza que deseja excluir este evento?')) {
      this.http.delete(`${this.apiUrl}/${id}`).subscribe(() => {
        this.eventos = this.eventos.filter(evento => evento.id !== id);
        this.selecionarDia(this.diaSelecionado!);
      });
    }
  }

  private formatarData(dia: number): string {
    const mes = (this.mesAtual + 1).toString().padStart(2, '0');
    const d = dia.toString().padStart(2, '0');
    return `${this.anoAtual}-${mes}-${d}`;
  }
}


