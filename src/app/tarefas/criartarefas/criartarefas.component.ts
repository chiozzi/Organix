import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Tarefa, TarefasService } from '../tarefas.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-criartarefas',
  standalone: false,
  templateUrl: './criartarefas.component.html',
  styleUrl: './criartarefas.component.css'
})
export class CriartarefasComponent implements OnInit {
  @Input() tarefa: Tarefa | null = null; // tarefa para edição, null = criar nova
  @Output() salvar = new EventEmitter<Tarefa>();
  @Output() fechar = new EventEmitter<void>();

  formTarefa!: FormGroup;
  fechando = false;

  constructor(private tarefasService: TarefasService) {}

  ngOnInit(): void {
    this.inicializarFormulario();
  }

  /** Calcula a flag automaticamente */
  calcularFlag(tarefa: Tarefa): 'Normal' | 'Pendente' | 'Urgente' | 'Atrasado' {
    if (!tarefa.dataVencimento) return 'Normal';

    const hoje = new Date();
    const vencimento = new Date(tarefa.dataVencimento);
    const diffDias = Math.ceil((vencimento.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDias < 0) return 'Atrasado';
    if (diffDias <= 2) return 'Urgente';
    if (diffDias <= 5) return 'Pendente';
    return 'Normal';
  }

  inicializarFormulario(): void {
    this.formTarefa = new FormGroup({
      titulo: new FormControl(this.tarefa?.titulo || '', Validators.required),
      descricao: new FormControl(this.tarefa?.descricao || ''),
      dataVencimento: new FormControl(this.tarefa?.dataVencimento || '', Validators.required),
      membros: new FormControl(this.tarefa?.membros ? this.tarefa.membros.join(', ') : ''),
      statusExecucao: new FormControl(this.tarefa?.statusExecucao || 'A Fazer', Validators.required)
      // flag removido do formulário porque agora é automático
    });
  }

  abrirModalComTarefa(tarefa: Tarefa | null): void {
    this.tarefa = tarefa;
    if (this.formTarefa) {
      this.formTarefa.reset({
        titulo: tarefa?.titulo || '',
        descricao: tarefa?.descricao || '',
        dataVencimento: tarefa?.dataVencimento || '',
        membros: tarefa?.membros ? tarefa.membros.join(', ') : '',
        statusExecucao: tarefa?.statusExecucao || 'A Fazer'
      });
    }
  }

  salvarTarefa(): void {
    if (this.formTarefa.invalid) return;

    const formValue = this.formTarefa.value;

    const tarefaParaSalvar: Tarefa = {
      ...this.tarefa, // mantém id se for edição
      titulo: formValue.titulo,
      descricao: formValue.descricao,
      dataVencimento: formValue.dataVencimento,
      membros: formValue.membros
        ? formValue.membros.split(',').map((m: string) => m.trim())
        : [],
      statusExecucao: formValue.statusExecucao,
      flag: 'Normal' // será sobrescrito abaixo
    };

    // Calcula flag automaticamente
    tarefaParaSalvar.flag = this.calcularFlag(tarefaParaSalvar);

    const operacao$ = this.tarefa?.id
      ? this.tarefasService.atualizar(this.tarefa.id, tarefaParaSalvar)
      : this.tarefasService.criar(tarefaParaSalvar);

    operacao$.subscribe({
      next: (tarefaSalva) => {
        this.salvar.emit(tarefaSalva);
        this.fecharModal();
      },
      error: (err) => console.error('Erro ao salvar tarefa:', err)
    });
  }

  cancelar(): void {
    this.fecharModal();
  }

  private fecharModal(): void {
    this.fechando = true;
    setTimeout(() => {
      this.formTarefa.reset({
        statusExecucao: 'A Fazer'
      });
      this.fechar.emit();
      this.fechando = false;
    }, 300);
  }
}