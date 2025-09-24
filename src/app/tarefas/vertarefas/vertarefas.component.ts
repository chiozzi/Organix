import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Flag, StatusExecucao, Tarefa, TarefasService } from '../tarefas.service';

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

  // Expor enums no template
  StatusExecucao = StatusExecucao;
  Flag = Flag;

  constructor(private tarefasService: TarefasService) {}

  fecharModal() {
    this.fechando = true;
    setTimeout(() => {
      this.fechar.emit();
      this.fechando = false;
    }, 300);
  }

  editarTarefa() {
    if (this.tarefa) this.editar.emit(this.tarefa);
  }

  concluirTarefa() {
    if (!this.tarefa || !this.tarefa.id) return;

    const tarefaAtualizada: Tarefa = {
      ...this.tarefa,
      statusExecucao: StatusExecucao.Concluido,
      flag: Flag.Concluido
    };

    this.tarefasService.atualizar(this.tarefa.id, tarefaAtualizada).subscribe({
      next: (t) => {
        this.concluir.emit(t);
        this.fecharModal();
      },
      error: (err) => console.error('Erro ao concluir tarefa:', err)
    });
  }

  tarefaStatusClass(flag?: Flag): string {
    switch (flag) {
      case Flag.Atrasado: return 'status atraso';
      case Flag.Urgente: return 'status urgente';
      case Flag.Pendente: return 'status pendente';
      case Flag.Concluido: return 'status concluido';
      case Flag.Normal: return 'status normal';
      default: return '';
    }
  }
}