import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Tarefa } from '../tarefas.service';

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

  fechando = false;

  fecharModal() {
    this.fechando = true;
    setTimeout(() => {
      this.fechar.emit();
      this.fechando = false;
    }, 300); // animação de fechamento
  }

  editarTarefa() {
    if (this.tarefa) {
      this.editar.emit(this.tarefa);
    }
  }

  tarefaStatusClass(condicao: string | undefined) {
    switch(condicao?.toLowerCase()) {
      case 'atrasado': return 'status atraso';
      case 'urgente': return 'status urgente';
      case 'pendente': return 'status pendente';
      default: return '';
    }
  }
}