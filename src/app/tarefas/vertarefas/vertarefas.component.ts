import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Flag, StatusExecucao, Tarefa, TarefasService } from '../tarefas.service';

@Component({
  selector: 'app-vertarefas',
  standalone: false,
  templateUrl: './vertarefas.component.html',
  styleUrl: './vertarefas.component.css'
})
export class VertarefasComponent implements OnInit, OnDestroy{
  @Input() tarefa: Tarefa | null | undefined;
  @Output() fechar = new EventEmitter<void>();
  @Output() editar = new EventEmitter<Tarefa>();
  @Output() concluir = new EventEmitter<Tarefa>();
  @Output() excluir = new EventEmitter<Tarefa>();

  fechando = false;
  StatusExecucao = StatusExecucao;
  Flag = Flag;
  mostrarCheck = false;

  constructor(private tarefasService: TarefasService) {}


  ngOnInit(): void {
    document.body.style.overflow = 'hidden';
  }

  ngOnDestroy(): void {
    document.body.style.overflow = '';
  }

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

  // Mostra o check gigante e esconde o modal
  this.mostrarCheck = true;

  const tarefaAtualizada: Tarefa = {
    ...this.tarefa,
    statusExecucao: StatusExecucao.Concluido,
    flag: Flag.Concluido
  };

  this.tarefasService.atualizar(this.tarefa.id, tarefaAtualizada).subscribe({
    next: () => {
      // Depois de 1s, fecha modal e emite tarefa concluída
      setTimeout(() => {
        this.concluir.emit(tarefaAtualizada);
        this.fecharModal();
        this.mostrarCheck = false;
      }, 1000);
    },
    error: (err) => console.error('Erro ao concluir tarefa:', err)
  });
}


// Excluir tarefa
excluirTarefa() {
  if (!this.tarefa || !this.tarefa.id) return;

  const confirmDelete = confirm('Tem certeza que deseja excluir esta tarefa?');
  if (!confirmDelete) return;

  const tarefaTemporaria: Tarefa = { ...this.tarefa };

  this.tarefasService.remover(this.tarefa.id).subscribe({
    next: () => {
      this.excluir.emit(tarefaTemporaria); // ✅ passa a tarefa excluída
      this.fecharModal();
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




