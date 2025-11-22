import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Tarefa, TarefasService, StatusExecucao, Flag } from '../tarefas.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-criartarefas',
  standalone: false,
  templateUrl: './criartarefas.component.html',
  styleUrl: './criartarefas.component.css'
})

export class CriartarefasComponent implements OnInit, OnDestroy {
  @Input() tarefa: Tarefa | null = null;
  @Output() salvar = new EventEmitter<Tarefa>();
  @Output() fechar = new EventEmitter<void>();

  formTarefa!: FormGroup;
  fechando = false;
  hoje: string = '';

  constructor(private tarefasService: TarefasService) {}

  ngOnInit(): void {
    document.body.style.overflow = 'hidden';
    this.inicializarFormulario();
    const hojeDate = new Date();
    this.hoje = hojeDate.toISOString().split('T')[0];
  }

  ngOnDestroy(): void {
    document.body.style.overflow = '';
  }


  inicializarFormulario(): void {
    this.formTarefa = new FormGroup({
      titulo: new FormControl(this.tarefa?.titulo || '', Validators.required),
      descricao: new FormControl(this.tarefa?.descricao || ''),
      dataVencimento: new FormControl(this.tarefa?.dataVencimento || '', Validators.required),
      horaVencimento: new FormControl(this.tarefa?.horaVencimento || '', Validators.required),
      statusExecucao: new FormControl(this.tarefa?.statusExecucao || StatusExecucao.AFazer, Validators.required)
    });

  }

  abrirModalComTarefa(tarefa: Tarefa | null): void {
    this.tarefa = tarefa;
    if (this.formTarefa) {
      this.formTarefa.reset({
        titulo: tarefa?.titulo || '',
        descricao: tarefa?.descricao || '',
        dataVencimento: tarefa?.dataVencimento || '',
        statusExecucao: tarefa?.statusExecucao || StatusExecucao.AFazer,
        flag: tarefa?.flag || Flag.Normal
      });
    }
  }

  salvarTarefa(): void {
    if (this.formTarefa.invalid) return;

    const formValue = this.formTarefa.value;
    const hojeDate = new Date(this.hoje);
    const dataSelecionada = new Date(formValue.dataVencimento);

    if (dataSelecionada < hojeDate) {
      alert('Não é permitido criar tarefa em datas anteriores a hoje.');
      return;
    }

    const tarefaParaSalvar: Tarefa = {
      ...this.tarefa,
      titulo: formValue.titulo,
      descricao: formValue.descricao,
      dataVencimento: formValue.dataVencimento,
      horaVencimento: formValue.horaVencimento,
      statusExecucao: formValue.statusExecucao,
      flag: this.tarefa ? this.tarefa.flag : Flag.Normal, // será recalculada depois
      ordem: this.tarefa?.ordem ?? 0
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

  cancelar(): void { this.fecharModal(); }

  fecharModal() {
  this.fechando = true;
  setTimeout(() => {
    this.fechar.emit();
    this.fechando = false;
  }, 300);
}
}


