import { Component, OnInit } from '@angular/core';
import { Tarefa, TarefasService } from './tarefas.service';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';

type StatusTarefa = 'A Fazer' | 'Em Atraso' | 'Em Andamento' | 'Concluido';

@Component({
  selector: 'app-tarefas',
  standalone: false,
  templateUrl: './tarefas.component.html',
  styleUrl: './tarefas.component.css'
})
export class TarefasComponent implements OnInit {
  tarefas: Tarefa[] = [];
  tarefaSelecionada: Tarefa | null = null;

  exibirCriarTarefa = false;
  tarefaParaEdicao: Tarefa | null = null;

  tarefasAFazerArray: Tarefa[] = [];
  tarefasEmAtrasoArray: Tarefa[] = [];
  tarefasEmAndamentoArray: Tarefa[] = [];
  tarefasConcluidasArray: Tarefa[] = [];

  constructor(private tarefasService: TarefasService) {}

  ngOnInit(): void {
    this.carregarTarefas();
  }

  carregarTarefas(): void {
    this.tarefasService.listar().subscribe({
      next: (dados) => {
        this.tarefas = dados || [];
        this.separarPorStatus();
      },
      error: (err) => console.error('Erro ao carregar tarefas:', err)
    });
  }

separarPorStatus(): void {
  const hoje = new Date();

  this.tarefas.forEach(t => {
    if (t.statusExecucao !== 'Concluido' && t.dataVencimento) {
      const vencimento = new Date(t.dataVencimento);
      if (vencimento < hoje) {
        t.flag = 'Atrasado';
      }
    }
  });

  this.tarefasAFazerArray = this.tarefas.filter(t => t.statusExecucao === 'A Fazer');
  this.tarefasEmAtrasoArray = this.tarefas.filter(t => t.statusExecucao === 'Em Atraso');
  this.tarefasEmAndamentoArray = this.tarefas.filter(t => t.statusExecucao === 'Em Andamento');
  this.tarefasConcluidasArray = this.tarefas.filter(t => t.statusExecucao === 'Concluido');
}
  

  abrirModal(tarefa: Tarefa): void {
    this.tarefaSelecionada = tarefa;
  }

  fecharModal(): void {
    this.tarefaSelecionada = null;
  }

  abrirCriarModal(): void {
    this.tarefaParaEdicao = null;
    this.exibirCriarTarefa = true;
  }

  fecharCriarModal(): void {
    this.exibirCriarTarefa = false;
    this.tarefaParaEdicao = null;
  }

  tarefaCriada(tarefa: Tarefa): void {
    this.fecharCriarModal();
    if (!tarefa) return;

    const index = this.tarefas.findIndex(t => t.id === tarefa.id);
    if (index >= 0) {
      this.tarefas[index] = tarefa;
    } else {
      this.tarefas.push(tarefa);
    }

    this.separarPorStatus();
  }

  editarTarefa(tarefa: Tarefa): void {
    this.fecharModal();
    this.tarefaParaEdicao = { ...tarefa };
    this.exibirCriarTarefa = true;

    setTimeout(() => {
      const modalCriar = document.querySelector('app-criartarefas') as any;
      modalCriar?.abrirModalComTarefa(this.tarefaParaEdicao);
    });
  }

  drop(event: CdkDragDrop<Tarefa[]>, statusDestino: StatusTarefa) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      const item = event.previousContainer.data[event.previousIndex];
      item.statusExecucao = statusDestino;
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    }
  }

  /** Retorna a classe de cor da flag */
  corFlag(flag: string): string {
    switch (flag.toLowerCase()) {
      case 'urgente': return 'urgente';
      case 'em atraso': return 'atrasado';
      case 'pendente': return 'pendente';
      default: return 'normal';
    }
  }
}