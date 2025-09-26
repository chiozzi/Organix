import { Component, OnInit } from '@angular/core';
import { Flag, Tarefa, TarefasService } from './tarefas.service';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';

// tarefas.service.ts
export enum StatusExecucao {
  AFazer = 'A Fazer',
  EmAtraso = 'Em Atraso',
  EmAndamento = 'Em Andamento',
  Concluido = 'Concluido'
}


@Component({
  selector: 'app-tarefas',
  standalone: false,
  templateUrl: './tarefas.component.html',
  styleUrl: './tarefas.component.css'
})
export class TarefasComponent implements OnInit {
  StatusExecucao = StatusExecucao;
  Flag = Flag;

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
        this.tarefas = (dados || []).map(t => ({
          ...t,
          statusExecucao: t.statusExecucao || StatusExecucao.AFazer,
          flag: t.statusExecucao === StatusExecucao.Concluido ? Flag.Concluido : (t.flag || Flag.Normal)
        }));
        this.separarPorStatus();
      },
      error: (err) => console.error('Erro ao carregar tarefas:', err)
    });
  }

  separarPorStatus(): void {
    const hoje = new Date();

    this.tarefas.forEach(t => {
      if (t.statusExecucao !== StatusExecucao.Concluido && t.dataVencimento) {
        const vencimento = new Date(t.dataVencimento);
        if (vencimento < hoje) {
          t.flag = Flag.Atrasado;
          t.statusExecucao = StatusExecucao.EmAtraso;
        }
      }
    });

    this.tarefasAFazerArray = this.tarefas.filter(t => t.statusExecucao === StatusExecucao.AFazer);
    this.tarefasEmAtrasoArray = this.tarefas.filter(t => t.statusExecucao === StatusExecucao.EmAtraso);
    this.tarefasEmAndamentoArray = this.tarefas.filter(t => t.statusExecucao === StatusExecucao.EmAndamento);
    this.tarefasConcluidasArray = this.tarefas.filter(t => t.statusExecucao === StatusExecucao.Concluido);
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

    this.atualizarFlag(tarefa);

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

  moverParaConcluidas(tarefa: Tarefa): void {
    if (!tarefa) return;

    tarefa.statusExecucao = StatusExecucao.Concluido;
    this.atualizarFlag(tarefa);

    this.tarefasService.atualizar(tarefa.id!, tarefa).subscribe({
      next: (tarefaAtualizada) => {
        const index = this.tarefas.findIndex(t => t.id === tarefaAtualizada.id);
        if (index >= 0) this.tarefas[index] = tarefaAtualizada;
        this.separarPorStatus();
      },
      error: (err) => console.error('Erro ao concluir tarefa:', err)
    });
  }

  drop(event: CdkDragDrop<Tarefa[]>, novoStatus: StatusExecucao) {
  if (event.previousContainer === event.container) {
    moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
  } else {
    transferArrayItem(
      event.previousContainer.data,
      event.container.data,
      event.previousIndex,
      event.currentIndex,
    );
  }

  const tarefa = event.container.data[event.currentIndex];
  if (tarefa?.id) {
    const tarefaAtualizada: Tarefa = {
      ...tarefa,
      statusExecucao: novoStatus
      // não seta flag aqui, o service já resolve
    };

    this.tarefasService.atualizar(tarefa.id, tarefaAtualizada).subscribe({
      next: (t) => console.log('Tarefa atualizada:', t),
      error: (err) => console.error('Erro ao mover tarefa:', err)
    });
  }
}



  removerTarefa(tarefaRemovida: Tarefa): void {
    if (!tarefaRemovida.id) return;

    this.tarefasService.remover(tarefaRemovida.id).subscribe({
      next: () => {
        this.tarefas = this.tarefas.filter(t => t.id !== tarefaRemovida.id);
        this.separarPorStatus();
        if (this.tarefaSelecionada?.id === tarefaRemovida.id) this.fecharModal();
      },
      error: (err) => console.error('Erro ao remover tarefa:', err)
    });
  }

  /** Atualiza a flag da tarefa conforme status e data de vencimento */
  atualizarFlag(tarefa: Tarefa): void {
    if (tarefa.statusExecucao === StatusExecucao.Concluido) {
      tarefa.flag = Flag.Concluido;
      return;
    }

    if (tarefa.dataVencimento) {
      const hoje = new Date();
      const vencimento = new Date(tarefa.dataVencimento);
      if (vencimento < hoje) {
        tarefa.flag = Flag.Atrasado;
        return;
      }
    }

    tarefa.flag = Flag.Normal; // default para tarefas não concluídas e não atrasadas
  }

  corFlag(flag?: Flag): string {
    switch (flag) {
      case Flag.Urgente: return 'urgente';
      case Flag.Atrasado: return 'atrasado';
      case Flag.Pendente: return 'pendente';
      case Flag.Concluido: return 'concluido';
      default: return 'normal';
    }
  }
}



