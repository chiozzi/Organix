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

  /** Inicializa ou reseta o formulário, preenchendo se for edição */
  inicializarFormulario(): void {
    this.formTarefa = new FormGroup({
      titulo: new FormControl(this.tarefa?.titulo || '', Validators.required),
      descricao: new FormControl(this.tarefa?.descricao || ''),
      dataVencimento: new FormControl(this.tarefa?.dataVencimento || ''),
      membros: new FormControl(this.tarefa?.membros ? this.tarefa.membros.join(', ') : ''),
      statusExecucao: new FormControl(this.tarefa?.statusExecucao || 'A Fazer', Validators.required),
      flag: new FormControl(this.tarefa?.flag || 'Normal', Validators.required)
    });
  }

  /** Chamada pelo componente pai para atualizar o formulário ao abrir o modal */
  abrirModalComTarefa(tarefa: Tarefa | null): void {
    this.tarefa = tarefa;
    if (this.formTarefa) {
      this.formTarefa.reset({
        titulo: tarefa?.titulo || '',
        descricao: tarefa?.descricao || '',
        dataVencimento: tarefa?.dataVencimento || '',
        membros: tarefa?.membros ? tarefa.membros.join(', ') : '',
        statusExecucao: tarefa?.statusExecucao || 'A Fazer',
        flag: tarefa?.flag || 'Normal'
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
      flag: formValue.flag
    };

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
        statusExecucao: 'A Fazer',
        flag: 'Normal'
      });
      this.fechar.emit();
      this.fechando = false;
    }, 300);
  }
}