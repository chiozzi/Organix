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

  // controle do modal de criação
  exibirCriarTarefa = false;

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
    return this.tarefas.filter(t => t.statusExecucao === 'A Fazer');
  }

  /** Em Atraso */
  get tarefasEmAtraso(): Tarefa[] {
    return this.tarefas.filter(t => t.statusExecucao === 'Em Atraso');
  }

  /** Em Andamento (tarefas já iniciadas ou em andamento) */
  get tarefasEmAndamento(): Tarefa[] {
    return this.tarefas.filter(
      t => t.statusExecucao === 'Em Andamento' || t.statusExecucao === 'A Fazer'
    );
  }

  /** Concluídas */
  get tarefasConcluidas(): Tarefa[] {
    return this.tarefas.filter(t => t.statusExecucao === 'Concluido');
  }

  // === Modal de detalhes ===

  abrirModal(tarefa: Tarefa): void {
    this.tarefaSelecionada = tarefa;
  }

  fecharModal(): void {
    this.tarefaSelecionada = null;
  }

  // === Modal de criação ===

  abrirCriarModal(): void {
    this.exibirCriarTarefa = true;
  }

  fecharCriarModal(): void {
    this.exibirCriarTarefa = false;
  }

  /** Recebe uma nova tarefa criada no modal e atualiza a lista */
  tarefaCriada(novaTarefa: Tarefa): void {
    this.fecharCriarModal();
    if (!novaTarefa) return;

    // adiciona na lista em memória para refletir imediatamente na UI
    this.tarefas.push(novaTarefa);
  }

  // === Edição ===

  editarTarefa(tarefa: Tarefa): void {
    if (!tarefa.id) return;
    this.tarefasService.atualizar(tarefa.id, tarefa).subscribe({
      next: () => this.carregarTarefas(),
      error: (err) => console.error('Erro ao editar tarefa:', err)
    });
  }
}