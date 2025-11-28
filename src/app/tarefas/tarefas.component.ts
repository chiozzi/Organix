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

  /**
   * Normaliza uma string para comparação (remove acentos, trim e lowercase).
   */
  private normaliza(s?: any): string {
    return s ? String(s).normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().toLowerCase() : '';
  }

  /**
   * Converte qualquer string de status para o enum StatusExecucao válido.
   * Se não encontrar correspondência, retorna AFazer (padrão).
   */
  private parseStatus(s?: any): StatusExecucao {
    const norm = this.normaliza(s);
    for (const val of Object.values(StatusExecucao)) {
      if (this.normaliza(val) === norm) return val as StatusExecucao;
    }
    return StatusExecucao.AFazer;
  }

  /**
   * Converte qualquer string de flag para o enum Flag válido.
   * Se não encontrar correspondência, retorna Normal (padrão).
   */
  private parseFlag(s?: any): Flag {
    const norm = this.normaliza(s);
    for (const val of Object.values(Flag)) {
      if (this.normaliza(val) === norm) return val as Flag;
    }
    return Flag.Normal;
  }

  carregarTarefas(): void {
    this.tarefasService.listar().subscribe(tarefas => {
      const agora = new Date();

      const fazerKey = this.normaliza(StatusExecucao.AFazer);
      const andamentoKey = this.normaliza(StatusExecucao.EmAndamento);
      const concluidoKey = this.normaliza(StatusExecucao.Concluido);
      const atrasoKey = this.normaliza(StatusExecucao.EmAtraso);

      // 1) Normaliza status/flag e trata datas inválidas
      tarefas.forEach(t => {
        // Garante status/flag válidos (evita strings vazias/estranhas)
        t.statusExecucao = this.parseStatus(t.statusExecucao);
        t.flag = this.parseFlag(t.flag);

        // Trata data/hora de vencimento com segurança
        const vencimentoString = t.dataVencimento ? `${t.dataVencimento}T${t.horaVencimento || '23:59'}` : null;
        const vencimento = vencimentoString ? new Date(vencimentoString) : null;
        const statusOriginal = t.statusExecucao;
        const flagOriginal = t.flag;

        if (vencimento && !isNaN(vencimento.getTime())) {
          // Só recalcula status de atraso se houver data válida
          if (this.normaliza(t.statusExecucao) !== this.normaliza(StatusExecucao.Concluido)) {
            if (vencimento < agora) {
              t.statusExecucao = StatusExecucao.EmAtraso;
            } else if (this.normaliza(statusOriginal) === atrasoKey && vencimento >= agora) {
              t.statusExecucao = StatusExecucao.AFazer;
            }
          }
        } else {
          // Sem data válida: manter status (ou garantir AFazer para novas)
          if (!t.statusExecucao) t.statusExecucao = StatusExecucao.AFazer;
        }

        // Recalcula flag de forma segura (definirFlag trata de Invalid Date internamente)
        t.flag = this.definirFlagAutomaticamenteSeguro(t);

        // Atualiza backend apenas se houve alteração real
        if (t.id && (t.statusExecucao !== statusOriginal || t.flag !== flagOriginal)) {
          this.tarefasService.atualizar(t.id!, t).subscribe({
            next: () => {},
            error: () => {}
          });
        }
      });

      // 2) Normaliza o status para filtros e preenche as listas
      const tarefasNorm = tarefas.map(t => ({
        ...t,
        _statusNorm: this.normaliza(t.statusExecucao)
      }));

      this.tarefasAFazer = tarefasNorm.filter(t =>
        [fazerKey, atrasoKey].includes(t._statusNorm) || this.normaliza(t.flag) === this.normaliza(Flag.Atrasado)
      );

      this.tarefasEmAndamento = tarefasNorm.filter(
        t => t._statusNorm === andamentoKey
      );

      this.tarefasConcluidas = tarefasNorm.filter(
        t => t._statusNorm === concluidoKey
      );
    }, err => {
      console.error('Erro ao listar tarefas:', err);
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

  /**
   * Recebe tarefa criada/atualizada pelo modal.
   * Se for edição, substitui; se for nova, insere na lista correta.
   */
  tarefaCriadaOuAtualizada(tarefaAtualizada: Tarefa): void {
    this.exibirCriarTarefa = false;

    // Garante status/flag válidos quando vem do formulário
    tarefaAtualizada.statusExecucao = this.parseStatus(tarefaAtualizada.statusExecucao);
    tarefaAtualizada.flag = this.parseFlag(tarefaAtualizada.flag);

    // Se não tiver id (por segurança) — recarrega tudo
    if (!tarefaAtualizada.id) {
      this.carregarTarefas();
      return;
    }

    const listas = [this.tarefasAFazer, this.tarefasEmAndamento, this.tarefasConcluidas];

    // Tenta substituir em alguma lista existente
    let substituiu = false;
    listas.forEach(lista => {
      const index = lista.findIndex(t => t.id === tarefaAtualizada.id);
      if (index !== -1) {
        lista[index] = tarefaAtualizada;
        substituiu = true;
      }
    });

    // Se não substituiu (ou seja: é nova ou a lista não continha), insere corretamente
    if (!substituiu) {
      const statusNorm = this.normaliza(tarefaAtualizada.statusExecucao);
      if (statusNorm === this.normaliza(StatusExecucao.EmAndamento)) {
        this.tarefasEmAndamento.splice(tarefaAtualizada.ordem ?? this.tarefasEmAndamento.length, 0, tarefaAtualizada);
      } else if (statusNorm === this.normaliza(StatusExecucao.Concluido)) {
        this.tarefasConcluidas.splice(tarefaAtualizada.ordem ?? this.tarefasConcluidas.length, 0, tarefaAtualizada);
      } else {
        // default: AFazer / Em Atraso
        this.tarefasAFazer.splice(tarefaAtualizada.ordem ?? this.tarefasAFazer.length, 0, tarefaAtualizada);
      }
    }

    // Por segurança, sincroniza com backend/refresh parcial
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

  /**
   * Versão segura da função de cálculo de flag.
   * Se data inválida -> retorna Flag.Normal (ou respeita status concluído).
   */
  private definirFlagAutomaticamenteSeguro(tarefa: Tarefa): Flag {
    const agora = new Date();
    const vencimentoString = tarefa.dataVencimento ? `${tarefa.dataVencimento}T${tarefa.horaVencimento || '23:59'}` : null;
    const vencimento = vencimentoString ? new Date(vencimentoString) : null;

    if (this.normaliza(tarefa.statusExecucao) === this.normaliza(StatusExecucao.Concluido)) {
      return Flag.Concluido;
    }

    if (!vencimento || isNaN(vencimento.getTime())) {
      // Sem data válida -> não marque como atrasado automaticamente
      return tarefa.flag ?? Flag.Normal;
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
      flag: this.definirFlagAutomaticamenteSeguro({ ...tarefa, statusExecucao: novoStatus }),
      ordem: event.currentIndex
    };

    this.tarefasService.atualizar(tarefa.id, tarefaAtualizada).subscribe();

    event.container.data.forEach((t, index) => {
      if (t.id) this.tarefasService.atualizarOrdem(t.id, index).subscribe();
    });
  }
}