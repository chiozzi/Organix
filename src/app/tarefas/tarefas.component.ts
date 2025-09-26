import { Component, OnInit, ViewChild } from '@angular/core';
import { Flag, Tarefa, TarefasService, StatusExecucao } from './tarefas.service';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { CriartarefasComponent } from './criartarefas/criartarefas.component';


@Component({
  selector: 'app-tarefas',
  standalone: false,
  templateUrl: './tarefas.component.html',
  styleUrl: './tarefas.component.css'
})
export class TarefasComponent implements OnInit {
  tarefas: Tarefa[] = [];
  tarefaSelecionada: Tarefa | null = null;
  tarefaParaEdicao: Tarefa | null = null;
  exibirCriarTarefa = false;

  tarefasAFazer: Tarefa[] = [];
  tarefasEmAtraso: Tarefa[] = [];
  tarefasEmAndamento: Tarefa[] = [];
  tarefasConcluidas: Tarefa[] = [];

  StatusExecucao = StatusExecucao;
  Flag = Flag;

  @ViewChild(CriartarefasComponent) criarTarefaChild!: CriartarefasComponent;

  constructor(private tarefasService: TarefasService) {}

  ngOnInit(): void {
    this.carregarTarefas();
  }

  carregarTarefas(): void {
    this.tarefasService.listar().subscribe({
      next: dados => { 
        this.tarefas = dados; 
        this.separarPorStatus(); 
      },
      error: err => console.error('Erro ao carregar tarefas:', err)
    });
  }

  separarPorStatus(): void {
    this.tarefasAFazer = this.tarefas.filter(t => t.statusExecucao === StatusExecucao.AFazer);
    this.tarefasEmAtraso = this.tarefas.filter(t => t.statusExecucao === StatusExecucao.EmAtraso);
    this.tarefasEmAndamento = this.tarefas.filter(t => t.statusExecucao === StatusExecucao.EmAndamento);
    this.tarefasConcluidas = this.tarefas.filter(t => t.statusExecucao === StatusExecucao.Concluido);
  }

  abrirCriarModal(tarefa?: Tarefa) {
    this.tarefaParaEdicao = tarefa ? { ...tarefa } : null;
    this.exibirCriarTarefa = true;
    setTimeout(() => this.criarTarefaChild?.abrirModalComTarefa(this.tarefaParaEdicao));
  }

  tarefaCriadaOuAtualizada(tarefa: Tarefa) {
    const index = this.tarefas.findIndex(t => t.id === tarefa.id);
    if (index >= 0) this.tarefas[index] = tarefa;
    else this.tarefas.push(tarefa);
    this.exibirCriarTarefa = false;
    this.separarPorStatus();
  }

  moverParaConcluidas(tarefa: Tarefa) {
    if (!tarefa.id) return;
    this.tarefasService.atualizarStatus(tarefa.id, StatusExecucao.Concluido).subscribe({
      next: () => {
        tarefa.statusExecucao = StatusExecucao.Concluido;
        this.separarPorStatus();
      },
      error: err => console.error('Erro ao concluir tarefa:', err)
    });
  }

  drop(event: CdkDragDrop<Tarefa[]>, novoStatus: StatusExecucao) {
    const tarefa = event.previousContainer.data[event.previousIndex];

    // 🔹 Bloqueia tarefas atrasadas de sair do card de EmAtraso (exceto concluído)
    if (tarefa.flag === Flag.Atrasado && novoStatus !== StatusExecucao.Concluido) {
      moveItemInArray(event.previousContainer.data, event.previousIndex, event.currentIndex);
      return;
    }

    // 🔹 Move dentro da mesma coluna ou entre colunas
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    }

    // 🔹 Atualiza no backend apenas o STATUS (não mexe em flags)
    if (tarefa?.id) {
      this.tarefasService.atualizarStatus(tarefa.id, novoStatus).subscribe({
        next: () => {
          tarefa.statusExecucao = novoStatus;
          this.separarPorStatus();
        },
        error: err => console.error('Erro ao mover tarefa:', err)
      });
    }
  }

  removerTarefa(tarefa: Tarefa) {
    if (!tarefa.id) return;
    this.tarefasService.remover(tarefa.id).subscribe({
      next: () => {
        this.tarefas = this.tarefas.filter(t => t.id !== tarefa.id);
        this.separarPorStatus();
      },
      error: err => console.error('Erro ao remover tarefa:', err)
    });
  }

  abrirModal(tarefa: Tarefa) { this.tarefaSelecionada = tarefa; }
  fecharModal() { this.tarefaSelecionada = null; }
}






