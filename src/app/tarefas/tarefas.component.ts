import { Component, OnInit, ViewChild } from '@angular/core';
import { Flag, Tarefa, TarefasService, StatusExecucao } from './tarefas.service';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { CriartarefasComponent } from './criartarefas/criartarefas.component';
import { ActivatedRoute } from '@angular/router';



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
  exibirCriarTarefa: boolean = false;
  tarefaParaEdicao: Tarefa | null = null;

  StatusExecucao = StatusExecucao;
  Flag = Flag;

  constructor(
  private tarefasService: TarefasService,
  private route: ActivatedRoute
) {}


  ngOnInit(): void {
  this.carregarTarefas();

  // Checar se veio um status via query params
  this.route.fragment.subscribe(fragment => {
    if (fragment) {
      setTimeout(() => {
        const el = document.getElementById(fragment);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          el.classList.add('destacado');
          setTimeout(() => el.classList.remove('destacado'), 2000);
        }
      }, 300);
    }
  });

}


  carregarTarefas(): void {
    this.tarefasService.listar().subscribe(tarefas => {
      // define a flag automaticamente em todas
      tarefas.forEach(t => t.flag = this.definirFlagAutomaticamente(t));

      // separa por status
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
    if (!tarefa.id) return;
    this.tarefasService.remover(tarefa.id).subscribe({
      next: () => {
        this.carregarTarefas();
        this.fecharModal();
      },
      error: (err) => console.error('Erro ao excluir tarefa:', err)
    });
  }

  tarefaConcluida(tarefa: Tarefa): void {
    if (!tarefa.id) return;

    const tarefaAtualizada: Tarefa = {
      ...tarefa,
      statusExecucao: StatusExecucao.Concluido,
      flag: Flag.Concluido
    };

    this.tarefasService.atualizar(tarefa.id, tarefaAtualizada).subscribe({
      next: () => {
        this.carregarTarefas();
        this.fecharModal();
      },
      error: (err) => console.error('Erro ao concluir tarefa:', err)
    });
  }

  /** 
   * Define a flag automaticamente de acordo com a data de vencimento 
   * e o status de execução.
   */
  private definirFlagAutomaticamente(tarefa: Tarefa): Flag {
    const agora = new Date();
    const vencimento = new Date(`${tarefa.dataVencimento}T${tarefa.horaVencimento || '23:59'}`);

    if (tarefa.statusExecucao === StatusExecucao.Concluido) {
      return Flag.Concluido;
    }

    if (vencimento < agora) {
      return Flag.Atrasado;
    }

    const diffHoras = (vencimento.getTime() - agora.getTime()) / (1000 * 60 * 60);

    if (diffHoras >= 72) {        // mais de 3 dias
      return Flag.Normal;
    } else if (diffHoras >= 24) { // entre 1 e 3 dias
      return Flag.Pendente;
    } else if (diffHoras > 0) {   // menos de 1 dia
      return Flag.Urgente;
    }

    return Flag.Atrasado;
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

    // reordena todas as tarefas da coluna
    event.container.data.forEach((t, index) => {
      if (t.id) this.tarefasService.atualizarOrdem(t.id, index).subscribe();
    });
  }

}





