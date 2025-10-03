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

  tarefasEmAtraso: Tarefa[] = [];
  tarefasAFazer: Tarefa[] = [];
  tarefasEmAndamento: Tarefa[] = [];
  tarefasConcluidas: Tarefa[] = [];

  tarefaSelecionada: Tarefa | null = null;
  exibirCriarTarefa = false;
  tarefaParaEdicao: Tarefa | null = null;

  StatusExecucao = StatusExecucao;
  Flag = Flag;

  constructor(private tarefasService: TarefasService) {}

  ngOnInit(): void {
    this.carregarTarefas();
  }

  carregarTarefas(): void {
    this.tarefasService.listar().subscribe(tarefas => {
      tarefas.forEach(t => {
        t.flag = this.definirFlagAutomaticamente(t);
      });

      this.tarefasEmAtraso    = tarefas.filter(t => t.statusExecucao === StatusExecucao.EmAtraso);
      this.tarefasAFazer      = tarefas.filter(t => t.statusExecucao === StatusExecucao.AFazer);
      this.tarefasEmAndamento = tarefas.filter(t => t.statusExecucao === StatusExecucao.EmAndamento);
      this.tarefasConcluidas  = tarefas.filter(t => t.statusExecucao === StatusExecucao.Concluido);
    });
  }

  abrirModal(tarefa: Tarefa): void {
    this.tarefaSelecionada = tarefa;
  }

  fecharModal(): void {
    this.tarefaSelecionada = null;
  }

  abrirCriarModal(tarefa?: Tarefa): void {
    this.tarefaParaEdicao = tarefa || null;
    this.exibirCriarTarefa = true;
  }

  tarefaCriadaOuAtualizada(tarefa: Tarefa): void {
    this.exibirCriarTarefa = false;
    this.carregarTarefas();
  }

  removerTarefa(tarefa: Tarefa): void {
    // Remove instantaneamente da tela
    this.tarefasEmAtraso    = this.tarefasEmAtraso.filter(t => t.id !== tarefa.id);
    this.tarefasAFazer      = this.tarefasAFazer.filter(t => t.id !== tarefa.id);
    this.tarefasEmAndamento = this.tarefasEmAndamento.filter(t => t.id !== tarefa.id);
    this.tarefasConcluidas  = this.tarefasConcluidas.filter(t => t.id !== tarefa.id);
  }

  private definirFlagAutomaticamente(tarefa: Tarefa): Flag {
    const hoje = new Date();
    const vencimento = new Date(tarefa.dataVencimento);

    if (tarefa.statusExecucao === StatusExecucao.Concluido) return Flag.Concluido;
    if (vencimento < hoje) return Flag.Atrasado;

    const diffDias = Math.ceil((vencimento.getTime() - hoje.getTime()) / (1000*60*60*24));
    if (diffDias <= 2) return Flag.Urgente;
    if (tarefa.statusExecucao === StatusExecucao.AFazer) return Flag.Pendente;

    return Flag.Normal;
  }

  drop(event: CdkDragDrop<Tarefa[]>): void {
    const tarefa = event.item.data as Tarefa;
    if (!tarefa?.id) return;

    const novaColuna = event.container.id as StatusExecucao;

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

    const tarefaAtualizada: Tarefa = {
      ...tarefa,
      statusExecucao: novaColuna,
      flag: this.definirFlagAutomaticamente({ ...tarefa, statusExecucao: novaColuna }),
      ordem: event.currentIndex
    };

    this.tarefasService.atualizar(tarefa.id, tarefaAtualizada).subscribe();

    event.container.data.forEach((t, index) => {
      if (t.id) this.tarefasService.atualizarOrdem(t.id, index).subscribe();
    });
  }

  tarefaConcluida(tarefa: Tarefa): void {
    // Remove da coluna atual
    this.tarefasEmAtraso    = this.tarefasEmAtraso.filter(t => t.id !== tarefa.id);
    this.tarefasAFazer      = this.tarefasAFazer.filter(t => t.id !== tarefa.id);
    this.tarefasEmAndamento = this.tarefasEmAndamento.filter(t => t.id !== tarefa.id);
    // Adiciona em concluídas
    this.tarefasConcluidas.push(tarefa);
  }
}



