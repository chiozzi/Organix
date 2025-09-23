  import { Component, EventEmitter, Input, Output } from '@angular/core';
  import { Tarefa, TarefasService } from '../tarefas.service';

  @Component({
    selector: 'app-vertarefas',
    standalone: false,
    templateUrl: './vertarefas.component.html',
    styleUrl: './vertarefas.component.css'
  })
export class VertarefasComponent {
  @Input() tarefa: Tarefa | null = null;
  @Output() fechar = new EventEmitter<void>();
  @Output() editar = new EventEmitter<Tarefa>();
  @Output() concluir = new EventEmitter<Tarefa>();

  fechando = false;

  constructor(private tarefasService: TarefasService  ) {}

  fecharModal() {
    this.fechando = true;
    setTimeout(() => {
      this.fechar.emit();
      this.fechando = false;
    }, 300);
  }

  editarTarefa() {
    if (this.tarefa) {
      this.editar.emit(this.tarefa);
    }
  }

  concluirTarefa() {
    if (this.tarefa && this.tarefa.id) {
      this.tarefasService.concluir(this.tarefa.id, this.tarefa).subscribe({
        next: (tarefaAtualizada) => {
          this.concluir.emit(tarefaAtualizada);
          this.fecharModal();
        },
        error: (err) => {
          console.error('Erro ao concluir tarefa:', err);
        }
      });
    }
  }

  /** Retorna a classe CSS baseada no flag */
  tarefaStatusClass(flag: Tarefa['flag'] | undefined): string {
    switch (flag) {
      case 'Atrasado': return 'status atraso';
      case 'Urgente':  return 'status urgente';
      case 'Pendente': return 'status pendente';
      case 'Normal':   return 'status normal';
      default: return '';
    }
  }
}
