import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Tarefa, TarefasService, StatusExecucao, Flag } from '../tarefas.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-criartarefas',
  standalone: false,
  templateUrl: './criartarefas.component.html',
  styleUrl: './criartarefas.component.css'
})
export class CriartarefasComponent implements OnInit {
  @Input() tarefa: Tarefa | null = null;
  @Output() salvar = new EventEmitter<Tarefa>();
  @Output() fechar = new EventEmitter<void>();

  formTarefa!: FormGroup;
  fechando = false;
  hoje: string = ''; // variável para min no input

  constructor(private tarefasService: TarefasService) {}

  ngOnInit(): void {
    this.inicializarFormulario();

    // define hoje em formato YYYY-MM-DD
    const hojeDate = new Date();
    this.hoje = hojeDate.toISOString().split('T')[0];
  }

  inicializarFormulario(): void {
    this.formTarefa = new FormGroup({
      titulo: new FormControl(this.tarefa?.titulo || '', Validators.required),
      descricao: new FormControl(this.tarefa?.descricao || ''),
      dataVencimento: new FormControl(this.tarefa?.dataVencimento || '', Validators.required),
      membros: new FormControl(this.tarefa?.membros ? this.tarefa.membros.join(', ') : ''),
      statusExecucao: new FormControl(this.tarefa?.statusExecucao || StatusExecucao.AFazer, Validators.required),
      flag: new FormControl(this.tarefa?.flag || Flag.Normal, Validators.required)
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
        statusExecucao: tarefa?.statusExecucao || StatusExecucao.AFazer,
        flag: tarefa?.flag || Flag.Normal
      });
    }
  }

  salvarTarefa(): void {
    if (this.formTarefa.invalid) return;

    const formValue = this.formTarefa.value;

    // validação extra de data
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
      membros: formValue.membros ? formValue.membros.split(',').map((m: string) => m.trim()) : [],
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
        statusExecucao: StatusExecucao.AFazer,
        flag: Flag.Normal
      });
      this.fechar.emit();
      this.fechando = false;
    }, 300);
  }
}

