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

  // === Getters para separar por statusExecucao ===

  /** A Fazer (tarefas ainda não iniciadas) */
  get tarefasAFazer(): Tarefa[] {
    return this.tarefas.filter(t => t.statusExecucao === 'nao_iniciado');
  }

  /** Em Andamento (tarefas já iniciadas ou em andamento) */
  get tarefasEmAndamento(): Tarefa[] {
    return this.tarefas.filter(
      t => t.statusExecucao === 'em_andamento' || t.statusExecucao === 'iniciado'
    );
  }

  /** Concluídas */
  get tarefasConcluidas(): Tarefa[] {
    return this.tarefas.filter(t => t.statusExecucao === 'concluido');
  }

  // (Se no futuro quiser mais colunas, é só criar novos getters aqui)

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