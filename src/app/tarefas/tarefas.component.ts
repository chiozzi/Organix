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
    this.carregarTarefas();
  }

  /** 🔹 Função para definir flag automaticamente */
  private definirFlagAutomaticamente(tarefa: Tarefa): Flag {
    const hoje = new Date();
    const vencimento = new Date(tarefa.dataVencimento);

    // Se já está concluído, flag sempre concluído
    if (tarefa.statusExecucao === StatusExecucao.Concluido) {
      return Flag.Concluido;
    }

    // Se já passou da data
    if (vencimento < hoje) {
      return Flag.Atrasado;
    }

    // Se vence em até 2 dias
    const diffDias = Math.ceil((vencimento.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDias <= 2) {
      return Flag.Urgente;
    }

    // Se está a fazer e longe do prazo
    if (tarefa.statusExecucao === StatusExecucao.AFazer) {
      return Flag.Pendente;
    }

    return Flag.Normal;
  }

  drop(event: CdkDragDrop<Tarefa[]>): void {
  const tarefa = event.item.data as Tarefa;
  const novaColuna = event.container.id as StatusExecucao;

  if (!tarefa.id) return;

  // 🔹 Mover visualmente no front
  if (event.previousContainer === event.container) {
    // mesma coluna → só reordena
    moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
  } else {
    // coluna diferente → remove de uma e adiciona na outra
    transferArrayItem(
      event.previousContainer.data,
      event.container.data,
      event.previousIndex,
      event.currentIndex
    );
  }

  // 🔹 Atualizar tarefa com novo status e flag
  const tarefaAtualizada: Tarefa = {
    ...tarefa,
    statusExecucao: novaColuna,
    flag: this.definirFlagAutomaticamente({ ...tarefa, statusExecucao: novaColuna }),
    ordem: event.currentIndex // salva a posição dentro da coluna
  };

  // 🔹 Atualiza no backend
  this.tarefasService.atualizar(tarefa.id, tarefaAtualizada).subscribe({
    next: () => console.log('Tarefa atualizada com sucesso'),
    error: (err) => console.error('Erro ao mover tarefa:', err)
  });

  // 🔹 Reordena todas as tarefas da coluna e salva no backend
  event.container.data.forEach((t, index) => {
    if (t.id) {
      this.tarefasService.atualizarOrdem(t.id, index).subscribe();
    }
  });
}



}













