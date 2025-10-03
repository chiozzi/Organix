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

  // Fecha o modal com animação
  fecharModal() {
    this.fechando = true;
    setTimeout(() => {
      this.fechar.emit();
      this.fechando = false;
    }, 300);
  }

  // Emite evento de edição
  editarTarefa() {
    if (!this.tarefa) return;
    this.editar.emit(this.tarefa);
  }

  // Concluir tarefa
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
        this.fecharModal();
      },
      error: (err) => console.error('Erro ao concluir tarefa:', err)
    });
  }

  // Excluir tarefa com opção de desfazer
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
              this.concluir.emit(t); // reaparece automaticamente
            },
            error: (err) => console.error('Erro ao restaurar tarefa:', err)
          });
        }
      },
      error: (err) => console.error('Erro ao excluir tarefa:', err)
    });
  }

  // Retorna classe CSS de acordo com a flag
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



