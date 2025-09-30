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
    this.tarefasAFazer = this.tarefas
      .filter(t => t.statusExecucao === StatusExecucao.AFazer)
      .sort((a,b) => (a.ordem ?? 0) - (b.ordem ?? 0));

    this.tarefasEmAtraso = this.tarefas
      .filter(t => t.statusExecucao === StatusExecucao.EmAtraso)
      .sort((a,b) => (a.ordem ?? 0) - (b.ordem ?? 0));

    this.tarefasEmAndamento = this.tarefas
      .filter(t => t.statusExecucao === StatusExecucao.EmAndamento)
      .sort((a,b) => (a.ordem ?? 0) - (b.ordem ?? 0));

    this.tarefasConcluidas = this.tarefas
      .filter(t => t.statusExecucao === StatusExecucao.Concluido)
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
    this.salvarOrdemGlobal();
  }

  drop(event: CdkDragDrop<Tarefa[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
      // atualiza status
      const tarefa = event.container.data[event.currentIndex];
      tarefa.statusExecucao = this.getStatusDoContainer(event.container.id);
    }

    this.salvarOrdemGlobal();
  }

  getStatusDoContainer(containerId: string): StatusExecucao {
    switch(containerId) {
      case 'AFazer': return StatusExecucao.AFazer;
      case 'EmAtraso': return StatusExecucao.EmAtraso;
      case 'EmAndamento': return StatusExecucao.EmAndamento;
      case 'Concluido': return StatusExecucao.Concluido;
      default: return StatusExecucao.AFazer;
    }
  }

  salvarOrdemGlobal() {
    const todasColunas = [
      { tarefas: this.tarefasAFazer, status: StatusExecucao.AFazer },
      { tarefas: this.tarefasEmAtraso, status: StatusExecucao.EmAtraso },
      { tarefas: this.tarefasEmAndamento, status: StatusExecucao.EmAndamento },
      { tarefas: this.tarefasConcluidas, status: StatusExecucao.Concluido }
    ];

    todasColunas.forEach(coluna => {
      coluna.tarefas.forEach((tarefa, index) => {
        tarefa.ordem = index;
        if (!tarefa.id) return;
        this.tarefasService.atualizar(tarefa.id, tarefa).subscribe({
          next: () => {},
          error: err => console.error('Erro ao salvar ordem:', err)
        });
      });
    });
  }

  removerTarefa(tarefa: Tarefa) {
    if (!tarefa.id) return;
    this.tarefasService.remover(tarefa.id).subscribe({
      next: () => {
        this.tarefas = this.tarefas.filter(t => t.id !== tarefa.id);
        this.separarPorStatus();
        this.salvarOrdemGlobal();
      },
      error: err => console.error('Erro ao remover tarefa:', err)
    });
  }

  abrirModal(tarefa: Tarefa) { this.tarefaSelecionada = tarefa; }
  fecharModal() { this.tarefaSelecionada = null; }
}










