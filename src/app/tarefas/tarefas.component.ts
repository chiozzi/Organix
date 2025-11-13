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

      // 🔹 Normaliza todos os status para comparação confiável
      const normaliza = (s?: any) =>
        s ? String(s).normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().toLowerCase() : '';

      const fazerKey = normaliza(StatusExecucao.AFazer);
      const andamentoKey = normaliza(StatusExecucao.EmAndamento);
      const concluidoKey = normaliza(StatusExecucao.Concluido);
      const atrasoKey = normaliza(StatusExecucao.EmAtraso);

      tarefas.forEach(t => {
        const vencimento = new Date(`${t.dataVencimento}T${t.horaVencimento || '23:59'}`);
        const statusOriginal = t.statusExecucao;
        const flagOriginal = t.flag;

        // 🔹 Atualiza status automaticamente
        if (normaliza(t.statusExecucao) !== normaliza(StatusExecucao.Concluido)) {
          if (vencimento < agora) {
            t.statusExecucao = StatusExecucao.EmAtraso;
          } else if (normaliza(t.statusExecucao) === atrasoKey && vencimento >= agora) {
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

      const tarefasNorm = tarefas.map(t => ({
        ...t,
        _statusNorm: normaliza(t.statusExecucao)
      }));

      // 🔹 Exibe tarefas “Em Atraso” junto das “A Fazer”
      this.tarefasAFazer = tarefasNorm.filter(t =>
        [fazerKey, atrasoKey].includes(t._statusNorm) || t.flag === Flag.Atrasado
      );

      this.tarefasEmAndamento = tarefasNorm.filter(
        t => t._statusNorm === andamentoKey
      );

      this.tarefasConcluidas = tarefasNorm.filter(
        t => t._statusNorm === concluidoKey
      );

      console.log('A FAZER:', this.tarefasAFazer);
      console.log('EM ANDAMENTO:', this.tarefasEmAndamento);
      console.log('CONCLUIDAS:', this.tarefasConcluidas);
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

    // Marca visualmente a tarefa para animação
    tarefa.removendo = true;

    // Espera o tempo da animação CSS (300ms) antes de remover do array
    setTimeout(() => {
      this.tarefasAFazer = this.tarefasAFazer.filter(t => t.id !== tarefa.id);
      this.tarefasEmAndamento = this.tarefasEmAndamento.filter(t => t.id !== tarefa.id);
      this.tarefasConcluidas = this.tarefasConcluidas.filter(t => t.id !== tarefa.id);
      this.fecharModal();
    }, 300);

    // Chama o backend normalmente
    this.tarefasService.remover(tarefa.id).subscribe({
      next: () => console.log(`✅ Tarefa ${tarefa.id} excluída do backend.`),
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