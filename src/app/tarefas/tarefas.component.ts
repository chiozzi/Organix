import { Component, OnInit } from '@angular/core';
import { Tarefa, TarefasService } from './tarefas.service';

@Component({
  selector: 'app-tarefas',
  standalone: false,
  templateUrl: './tarefas.component.html',
  styleUrl: './tarefas.component.css'
})
export class TarefasComponent implements OnInit {
  tarefas: Tarefa[] = []; // lista de todas as tarefas
  tarefaSelecionada: Tarefa | null = null; // tarefa aberta no modal

  constructor(private tarefasService: TarefasService) {}

  ngOnInit(): void {
    this.carregarTarefas();
  }

  carregarTarefas(): void {
    this.tarefasService.listar().subscribe({
      next: (dados) => {
        this.tarefas = dados || [];
      },
      error: (err) => console.error('Erro ao carregar tarefas:', err)
    });
  }

  // ✅ Getters para evitar repetir filtros no carregarTarefas()
  get atrasadas(): Tarefa[] {
    return this.tarefas.filter(t => t.status === 'atrasado');
  }

  get urgentes(): Tarefa[] {
    return this.tarefas.filter(t => t.status === 'urgente');
  }

  get pendentes(): Tarefa[] {
    return this.tarefas.filter(t => t.status === 'pendente');
  }

  abrirModal(tarefa: Tarefa): void {
    this.tarefaSelecionada = tarefa;
  }

  fecharModal(): void {
    this.tarefaSelecionada = null;
  }

  editarTarefa(tarefa: Tarefa): void {
    if (!tarefa.id) return;
    this.tarefasService.atualizar(tarefa.id, tarefa).subscribe({
      next: () => this.carregarTarefas(),
      error: (err) => console.error('Erro ao editar tarefa:', err)
    });
  }
}