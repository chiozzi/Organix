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

    // Força flag Concluido se status for Concluido
    tarefa.flag = tarefa.statusExecucao === StatusExecucao.Concluido ? Flag.Concluido : (tarefa.flag || Flag.Normal);

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

  drop(event: CdkDragDrop<Tarefa[]>, statusDestino: StatusExecucao) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      const item = event.previousContainer.data[event.previousIndex];
      item.statusExecucao = statusDestino;

      // Força flag Concluido se status for Concluido
      if (statusDestino === StatusExecucao.Concluido) {
        item.flag = Flag.Concluido;
      }

      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );

      if (item.id) {
        this.tarefasService.atualizar(item.id, item).subscribe({
          next: (tarefaAtualizada) => {
            const index = this.tarefas.findIndex(t => t.id === tarefaAtualizada.id);
            if (index >= 0) this.tarefas[index] = tarefaAtualizada;
          },
          error: (err) => console.error('Erro ao atualizar tarefa:', err)
        });
      }
    }
  }

  moverParaConcluidas(tarefa: Tarefa) {
    this.tarefasAFazerArray = this.tarefasAFazerArray.filter(t => t.id !== tarefa.id);
    this.tarefasEmAtrasoArray = this.tarefasEmAtrasoArray.filter(t => t.id !== tarefa.id);
    this.tarefasEmAndamentoArray = this.tarefasEmAndamentoArray.filter(t => t.id !== tarefa.id);

    tarefa.statusExecucao = StatusExecucao.Concluido;
    tarefa.flag = Flag.Concluido;

    this.tarefasConcluidasArray.push(tarefa);

    if (tarefa.id) {
      this.tarefasService.atualizar(tarefa.id, tarefa).subscribe({
        next: (tarefaAtualizada) => {
          const index = this.tarefas.findIndex(t => t.id === tarefaAtualizada.id);
          if (index >= 0) this.tarefas[index] = tarefaAtualizada;
        },
        error: (err) => console.error('Erro ao atualizar tarefa:', err)
      });
    }
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

