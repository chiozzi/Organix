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

    // Inicializa o formulário reativo
    this.formTarefa = new FormGroup({
      titulo: new FormControl('', Validators.required),
      descricao: new FormControl(''),
      dataVencimento: new FormControl(''),
      membros: new FormControl(''),
      prioridade: new FormControl('media'),
      statusExecucao: new FormControl('nao_iniciado'),
      condicao: new FormControl('normal')
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
      prioridade: 'media',
      statusExecucao: 'nao_iniciado',
      condicao: 'normal'
    });
    this.fechar.emit();
  }

  salvarTarefa(): void {
    if (this.formTarefa.invalid) return;

    const novaTarefa: Tarefa = this.formTarefa.value;
    this.tarefas.push(novaTarefa);  // adiciona na lista local
    this.salvar.emit(novaTarefa);   // emite para o pai, se necessário
    this.fecharCriarModal();
  }

  cancelar(): void {
    this.fecharCriarModal();
  }

  // Getters por status
  get tarefasAFazer(): Tarefa[] {
    return this.tarefas.filter(t => t.statusExecucao === 'nao_iniciado');
  }

  get tarefasEmAtraso(): Tarefa[] {
    return this.tarefas.filter(t => t.statusExecucao === 'em_atraso');
  }

  get tarefasEmAndamento(): Tarefa[] {
    return this.tarefas.filter(t => t.statusExecucao === 'em_andamento' || t.statusExecucao === 'iniciado');
  }

  get tarefasConcluidas(): Tarefa[] {
    return this.tarefas.filter(t => t.statusExecucao === 'concluido');
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