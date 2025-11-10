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

  constructor(
    private tarefasService: TarefasService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.carregarTarefas();

    // 🔹 Scroll automático se vier fragmento na URL
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
      console.log('RAW TAREFAS:', JSON.stringify(tarefas, null, 2));

      const agora = new Date();

      tarefas.forEach(t => {
        const vencimento = new Date(`${t.dataVencimento}T${t.horaVencimento || '23:59'}`);
        const statusOriginal = t.statusExecucao;
        const flagOriginal = t.flag;

        // 🔹 Atualiza status automaticamente
        if (t.statusExecucao !== StatusExecucao.Concluido) {
          if (vencimento < agora) {
            t.statusExecucao = StatusExecucao.EmAtraso;
          } else if (t.statusExecucao === StatusExecucao.EmAtraso && vencimento >= agora) {
            t.statusExecucao = StatusExecucao.AFazer;
          }
        }

        // 🔹 Atualiza flag automaticamente
        t.flag = this.definirFlagAutomaticamente(t);

        // 🔹 Atualiza no backend se algo mudou
        if (t.statusExecucao !== statusOriginal || t.flag !== flagOriginal) {
          this.tarefasService.atualizar(t.id!, t).subscribe();
        }
      });

      // 🧠 Normaliza texto do status
      const normaliza = (s?: any) => (s ? String(s).trim().toLowerCase() : '');
      const fazerKey = normaliza('A Fazer');
      const andamentoKey = normaliza('Em Andamento');
      const concluidoKey = normaliza('Concluído');
      const atrasoKey = normaliza('Em Atraso');

      const tarefasNorm = tarefas.map(t => ({
        ...t,
        _statusNorm: normaliza(t.statusExecucao)
      }));

      // 🔹 Exibe tarefas “Em Atraso” junto das “A Fazer”
      this.tarefasAFazer = tarefasNorm
        .filter(t =>
          t._statusNorm === fazerKey ||
          t._statusNorm === atrasoKey ||
          t.flag === Flag.Atrasado
        )
        .map(t => ({ ...t } as Tarefa));

      this.tarefasEmAndamento = tarefasNorm
        .filter(t => t._statusNorm === andamentoKey)
        .map(t => ({ ...t } as Tarefa));

      this.tarefasConcluidas = tarefasNorm
        .filter(t => t._statusNorm === concluidoKey)
        .map(t => ({ ...t } as Tarefa));
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
      error: err => console.error('Erro ao excluir tarefa:', err)
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
      error: err => console.error('Erro ao concluir tarefa:', err)
    });
  }

  /** 
   * Define flag automaticamente de acordo com a data de vencimento 
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

    if (diffHoras >= 72) {
      return Flag.Normal;
    } else if (diffHoras >= 24) {
      return Flag.Pendente;
    } else if (diffHoras > 0) {
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

    event.container.data.forEach((t, index) => {
      if (t.id) this.tarefasService.atualizarOrdem(t.id, index).subscribe();
    });
  }
}