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
    this.tarefasAFazer = this.tarefas.filter(t => t.statusExecucao === StatusExecucao.AFazer)
                                    .sort((a,b) => (a.ordem ?? 0) - (b.ordem ?? 0));
    this.tarefasEmAtraso = this.tarefas.filter(t => t.statusExecucao === StatusExecucao.EmAtraso)
                                       .sort((a,b) => (a.ordem ?? 0) - (b.ordem ?? 0));
    this.tarefasEmAndamento = this.tarefas.filter(t => t.statusExecucao === StatusExecucao.EmAndamento)
                                          .sort((a,b) => (a.ordem ?? 0) - (b.ordem ?? 0));
    this.tarefasConcluidas = this.tarefas.filter(t => t.statusExecucao === StatusExecucao.Concluido)
                                        .sort((a,b) => (a.ordem ?? 0) - (b.ordem ?? 0));
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

    this.separarPorStatus();

    this.salvarTodasOrdens();
  }

  drop(event: CdkDragDrop<Tarefa[]>, novoStatus: StatusExecucao) {
    const tarefa = event.previousContainer.data[event.previousIndex];

    if (tarefa.flag === Flag.Atrasado && novoStatus !== StatusExecucao.Concluido) return;

    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(event.previousContainer.data, event.container.data, event.previousIndex, event.currentIndex);
      tarefa.statusExecucao = novoStatus;
    }

    this.separarPorStatus();
    this.salvarTodasOrdens();
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

  salvarTodasOrdens() {
    const salvarOrdem = (tarefas: Tarefa[]) => {
      tarefas.forEach((tarefa, index) => {
        tarefa.ordem = index;
        if (tarefa.id != null) {
          this.tarefasService.atualizarOrdem(tarefa.id, index).subscribe();
        }
      });
    };

    salvarOrdem(this.tarefasAFazer);
    salvarOrdem(this.tarefasEmAtraso);
    salvarOrdem(this.tarefasEmAndamento);
    salvarOrdem(this.tarefasConcluidas);
  }

  moverParaConcluidas(tarefa: Tarefa) {
  if (!tarefa.id) return;
  tarefa.statusExecucao = StatusExecucao.Concluido;

  // Atualiza no backend
  this.tarefasService.atualizar(tarefa.id, tarefa).subscribe({
    next: () => this.separarPorStatus(),
    error: err => console.error('Erro ao concluir tarefa:', err)
  });
}


  abrirModal(tarefa: Tarefa) { this.tarefaSelecionada = tarefa; }
  fecharModal() { this.tarefaSelecionada = null; }
}









