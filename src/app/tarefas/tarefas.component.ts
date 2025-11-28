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

  tarefasAFazer: Tarefa[] = [];
  tarefasEmAndamento: Tarefa[] = [];
  tarefasConcluidas: Tarefa[] = [];
  mostrarConcluidas: boolean = true;

  tarefaSelecionada: Tarefa | null = null;
  exibirCriarTarefa: boolean = false;
  tarefaParaEdicao: Tarefa | null = null;

  StatusExecucao = StatusExecucao;
  Flag = Flag;

  // 🔹 Mapa correto entre ID das colunas e os enums
  private mapColunaParaStatus: any = {
    afazer: StatusExecucao.AFazer,
    emandamento: StatusExecucao.EmAndamento,
    concluidas: StatusExecucao.Concluido
  };

  constructor(
    private tarefasService: TarefasService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.carregarTarefas();

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

  alternarConcluidas(): void {
    this.mostrarConcluidas = !this.mostrarConcluidas;
  }

  carregarTarefas(): void {
    this.tarefasService.listar().subscribe(tarefas => {
      const agora = new Date();

      const normaliza = (s?: any) =>
        s ? String(s).normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().toLowerCase() : '';

      const fazerKey = normaliza(StatusExecucao.AFazer);
      const andamentoKey = normaliza(StatusExecucao.EmAndamento);
      const concluidoKey = normaliza(StatusExecucao.Concluido);
      const atrasoKey = normaliza(StatusExecucao.EmAtraso);

      tarefas.forEach(t => {
        const vencimentoString = t.dataVencimento ? 
          `${t.dataVencimento}T${t.horaVencimento || '23:59'}` : null;

        const vencimento = vencimentoString ? new Date(vencimentoString) : null;

        const statusOriginal = t.statusExecucao;
        const flagOriginal = t.flag;


        if (vencimento && !isNaN(vencimento.getTime())) {
          if (normaliza(t.statusExecucao) !== normaliza(StatusExecucao.Concluido)) {
            if (vencimento < agora) {
              t.statusExecucao = StatusExecucao.EmAtraso;
            } else if (normaliza(t.statusExecucao) === atrasoKey && vencimento >= agora) {
              t.statusExecucao = StatusExecucao.AFazer;
            }
          }
        }




        t.flag = this.definirFlagAutomaticamente(t);

        if (t.statusExecucao !== statusOriginal || t.flag !== flagOriginal) {
          this.tarefasService.atualizar(t.id!, t).subscribe();
        }
      });

      const tarefasNorm = tarefas.map(t => ({
        ...t,
        _statusNorm: normaliza(t.statusExecucao)
      }));

      this.tarefasAFazer = tarefasNorm.filter(t =>
        [fazerKey, atrasoKey].includes(t._statusNorm) || t.flag === Flag.Atrasado
      );

      this.tarefasEmAndamento = tarefasNorm.filter(
        t => t._statusNorm === andamentoKey
      );

      this.tarefasConcluidas = tarefasNorm.filter(
        t => t._statusNorm === concluidoKey
      );
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

  // 🔥 Correção do BUG 1 — tarefa editada era substituída pela versão antiga ao concluir
  tarefaCriadaOuAtualizada(tarefaAtualizada: Tarefa): void {
    this.exibirCriarTarefa = false;

    // garante que a nova tarefa entra em uma lista
    if (!tarefaAtualizada.statusExecucao) {
      tarefaAtualizada.statusExecucao = StatusExecucao.AFazer;
    }

    const listas = [this.tarefasAFazer, this.tarefasEmAndamento, this.tarefasConcluidas];

    listas.forEach(lista => {
      const index = lista.findIndex(t => t.id === tarefaAtualizada.id);
      if (index !== -1) lista[index] = tarefaAtualizada;
    });

    this.carregarTarefas();
  }


  removerTarefa(tarefa: Tarefa): void {
    if (!tarefa.id) return;

    tarefa.removendo = true;

    setTimeout(() => {
      this.tarefasAFazer = this.tarefasAFazer.filter(t => t.id !== tarefa.id);
      this.tarefasEmAndamento = this.tarefasEmAndamento.filter(t => t.id !== tarefa.id);
      this.tarefasConcluidas = this.tarefasConcluidas.filter(t => t.id !== tarefa.id);
      this.fecharModal();
    }, 300);

    this.tarefasService.remover(tarefa.id).subscribe();
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
      }
    });
  }

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

    if (diffHoras >= 72) return Flag.Normal;
    if (diffHoras >= 24) return Flag.Pendente;
    if (diffHoras > 0) return Flag.Urgente;

    return Flag.Atrasado;
  }

  // 🔥 Correção total do BUG 2 — arrastar tarefa gravava status errado
  drop(event: CdkDragDrop<Tarefa[]>): void {
    const tarefa = event.item.data as Tarefa;
    if (!tarefa?.id) return;

    const colunaId = event.container.id;
    const novoStatus = this.mapColunaParaStatus[colunaId];

    if (!novoStatus) return;

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
      statusExecucao: novoStatus,
      flag: this.definirFlagAutomaticamente({ ...tarefa, statusExecucao: novoStatus }),
      ordem: event.currentIndex
    };

    this.tarefasService.atualizar(tarefa.id, tarefaAtualizada).subscribe();

    event.container.data.forEach((t, index) => {
      if (t.id) this.tarefasService.atualizarOrdem(t.id, index).subscribe();
    });
  }
}