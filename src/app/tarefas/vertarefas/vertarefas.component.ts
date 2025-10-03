import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Flag, StatusExecucao, Tarefa, TarefasService } from '../tarefas.service';

@Component({
  selector: 'app-vertarefas',
  standalone: false,
  templateUrl: './vertarefas.component.html',
  styleUrl: './vertarefas.component.css'
})
export class VertarefasComponent {
  @Input() tarefa: Tarefa | null | undefined;
  @Output() fechar = new EventEmitter<void>();
  @Output() editar = new EventEmitter<Tarefa>();
  @Output() concluir = new EventEmitter<Tarefa>();
  @Output() excluir = new EventEmitter<Tarefa>();

  fechando = false;
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
    if (!this.tarefa) return;
    this.editar.emit(this.tarefa);
  }

  concluirTarefa() {
    if (!this.tarefa || !this.tarefa.id) return;

    const tarefaAtualizada: Tarefa = {
      ...this.tarefa,
      statusExecucao: StatusExecucao.Concluido,
      flag: Flag.Concluido
    };

    this.tarefasService.atualizar(this.tarefa.id, tarefaAtualizada).subscribe({
      next: (t: Tarefa) => {
        this.tarefa = t;
        this.concluir.emit(t);
      },
      error: (err) => console.error('Erro ao concluir tarefa:', err)
    });
  }

  excluirTarefa() {
    if (!this.tarefa || !this.tarefa.id) return;

    const confirmDelete = confirm('Tem certeza que deseja excluir esta tarefa?');
    if (!confirmDelete) return;

    const tarefaTemporaria: Tarefa = { ...this.tarefa };

    this.tarefasService.remover(this.tarefa.id).subscribe({
      next: () => {
        this.excluir.emit(tarefaTemporaria);
        this.fecharModal();

        const desfazer = confirm('Tarefa excluída com sucesso! Deseja desfazer?');
        if (desfazer) {
          this.tarefasService.criar(tarefaTemporaria).subscribe({
            next: (t: Tarefa) => {
              alert('Tarefa restaurada com sucesso!');
              this.concluir.emit(t); // opcional: reaparece automaticamente
            },
            error: (err) => console.error('Erro ao restaurar tarefa:', err)
          });
        }
      },
      error: (err) => console.error('Erro ao excluir tarefa:', err)
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


