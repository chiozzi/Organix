import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Tarefa, TarefasService } from '../tarefas.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-criartarefas',
  standalone: false,
  templateUrl: './criartarefas.component.html',
  styleUrl: './criartarefas.component.css'
})
export class CriartarefasComponent implements OnInit {
  @Output() salvar = new EventEmitter<Tarefa>();
  @Output() fechar = new EventEmitter<void>();

  tarefas: Tarefa[] = [];
  formTarefa!: FormGroup;

  exibirCriarTarefa = false;

  constructor(private tarefasService: TarefasService) {}

  ngOnInit(): void {
    this.carregarTarefas();

    // Inicializa o formulário reativo com valores padronizados
    this.formTarefa = new FormGroup({
      titulo: new FormControl('', Validators.required),
      descricao: new FormControl(''),
      dataVencimento: new FormControl(''),
      membros: new FormControl(''),
      statusExecucao: new FormControl('A Fazer', Validators.required),
      flag: new FormControl('Normal', Validators.required)
    });
  }

  carregarTarefas(): void {
    this.tarefasService.listar().subscribe({
      next: dados => this.tarefas = dados || [],
      error: err => console.error('Erro ao carregar tarefas:', err)
    });
  }

  abrirCriarModal(): void {
    this.exibirCriarTarefa = true;
  }

  fecharCriarModal(): void {
    this.exibirCriarTarefa = false;
    this.formTarefa.reset({
      statusExecucao: 'A Fazer',
      flag: 'Normal'
    });
    this.fechar.emit();
  }

  salvarTarefa(): void {
    if (this.formTarefa.invalid) return;

    const formValue = this.formTarefa.value;

    const novaTarefa: Tarefa = {
      titulo: formValue.titulo,
      descricao: formValue.descricao,
      dataVencimento: formValue.dataVencimento,
      membros: formValue.membros
        ? formValue.membros.split(',').map((m: string) => m.trim())
        : [],
      statusExecucao: formValue.statusExecucao,
      flag: formValue.flag
    };

    // Chama o serviço para criar no backend
    this.tarefasService.criar(novaTarefa).subscribe({
      next: (tarefaCriada) => {
        this.tarefas.push(tarefaCriada);      // adiciona na lista local
        this.salvar.emit(tarefaCriada);       // emite para o pai
        this.fecharCriarModal();              // fecha o modal
      },
      error: (err) => console.error('Erro ao criar tarefa:', err)
    });
  }

  cancelar(): void {
    this.fecharCriarModal();
  }

  // Getters por status
  get tarefasAFazer(): Tarefa[] {
    return this.tarefas.filter(t => t.statusExecucao === 'A Fazer');
  }

  get tarefasEmAtraso(): Tarefa[] {
    return this.tarefas.filter(t => t.statusExecucao === 'Em Atraso');
  }

  get tarefasEmAndamento(): Tarefa[] {
    return this.tarefas.filter(t => t.statusExecucao === 'Em Andamento');
  }

  get tarefasConcluidas(): Tarefa[] {
    return this.tarefas.filter(t => t.statusExecucao === 'Concluido');
  }

  // Edição de tarefas
  editarTarefa(tarefa: Tarefa): void {
    if (!tarefa.id) return;

    this.tarefasService.atualizar(tarefa.id, tarefa).subscribe({
      next: () => this.carregarTarefas(),
      error: err => console.error('Erro ao editar tarefa:', err)
    });
  }
}