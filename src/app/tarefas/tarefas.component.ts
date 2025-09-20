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

  // Controle do modal de criação/edição
  exibirCriarTarefa = false;
  tarefaParaEdicao: Tarefa | null = null;

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

  // === Getters por statusExecucao ===
  get tarefasAFazer(): Tarefa[] {
    return this.tarefas.filter(t => t.statusExecucao === 'A Fazer');
  }
  get tarefasEmAtraso(): Tarefa[] {
    return this.tarefas.filter(t => t.statusExecucao === 'Em Atraso');
  }
  get tarefasEmAndamento(): Tarefa[] {
    return this.tarefas.filter(
      t => t.statusExecucao === 'Em Andamento' || t.statusExecucao === 'A Fazer'
    );
  }
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

  // === Modal de criação/edição ===
  abrirCriarModal(): void {
    this.tarefaParaEdicao = null; // Criar nova tarefa
    this.exibirCriarTarefa = true;
  }
  fecharCriarModal(): void {
    this.exibirCriarTarefa = false;
    this.tarefaParaEdicao = null;
  }

  // Recebe nova tarefa criada ou editada
  tarefaCriada(tarefa: Tarefa): void {
    this.fecharCriarModal();
    if (!tarefa) return;

    const index = this.tarefas.findIndex(t => t.id === tarefa.id);
    if (index >= 0) {
      // Atualiza tarefa existente
      this.tarefas[index] = tarefa;
    } else {
      // Adiciona nova tarefa
      this.tarefas.push(tarefa);
    }
  }

  // === Edição via modal de visualização ===
  editarTarefa(tarefa: Tarefa): void {
    // Fecha modal de visualização e abre modal de criação para edição
    this.fecharModal();
    this.tarefaParaEdicao = { ...tarefa }; // Cria cópia para edição
    this.exibirCriarTarefa = true;

    // Garante que o formulário seja preenchido imediatamente
    setTimeout(() => {
      const modalCriar = document.querySelector('app-criartarefas') as any;
      modalCriar?.abrirModalComTarefa(this.tarefaParaEdicao);
    });
  }
}