import { Component, OnInit } from '@angular/core';
import { Tarefa, TarefasService } from './tarefas.service';

@Component({
  selector: 'app-tarefas',
  standalone: false,
  templateUrl: './tarefas.component.html',
  styleUrl: './tarefas.component.css'
})
export class TarefasComponent implements OnInit {
  tarefas: Tarefa[] = [];
  tarefaSelecionada: Tarefa | null = null;

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

  // 🔥 Getters baseados no "status" (para usar no HTML)
  get tarefasAtrasadas(): Tarefa[] {
    return this.tarefas.filter(t => t.condicao === 'atrasado');
  }

  get tarefasUrgentes(): Tarefa[] {
    return this.tarefas.filter(t => t.condicao === 'urgente');
  }

  get tarefasPendentes(): Tarefa[] {
    return this.tarefas.filter(t => t.condicao === 'pendente');
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