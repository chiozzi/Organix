import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Tarefa } from '../../tarefas/tarefas.service';

@Component({
  selector: 'app-listartarefas',
  standalone: false,
  templateUrl: './listartarefas.component.html',
  styleUrl: './listartarefas.component.css'
})
export class ListartarefasComponent {
  @Input() tarefas: Tarefa[] = [];
  @Input() titulo: string = 'Tarefas';
  @Output() fechar = new EventEmitter<void>();
  @Output() editar = new EventEmitter<Tarefa>();
  @Output() abrirTarefa = new EventEmitter<Tarefa>(); // se quiser abrir detalhe

  fecharModal() {
    this.fechar.emit();
  }

  onEditar(t: Tarefa) {
    this.editar.emit(t);
  }

  abrirTarefaDetalhe(t: Tarefa) {
    this.abrirTarefa.emit(t);
  }
}
