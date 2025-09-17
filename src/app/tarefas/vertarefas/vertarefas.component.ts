import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-vertarefas',
  standalone: false,
  templateUrl: './vertarefas.component.html',
  styleUrl: './vertarefas.component.css'
})



export class VertarefasComponent {
  @Input() tarefa: any | null = null;
  @Output() fechar = new EventEmitter<void>();
  @Output() editar = new EventEmitter<any>();

  fechando = false;

  fecharModal() {
    this.fechando = true;
    setTimeout(() => {
      this.fechar.emit();
      this.fechando = false;
    }, 300); // 300ms é a duração da animação
  }

  editarTarefa() {
    this.editar.emit(this.tarefa);
  }

  tarefaStatusClass(status: string | undefined) {
    switch(status?.toLowerCase()) {
      case 'atrasado': return 'status atraso';
      case 'urgente': return 'status urgente';
      case 'pendente': return 'status pendente';
      default: return '';
    }
  }
}
