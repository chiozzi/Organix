import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Tarefa } from '../../tarefas/tarefas.service';

@Component({
  selector: 'app-listartarefas',
  standalone: false,
  templateUrl: './listartarefas.component.html',
  styleUrl: './listartarefas.component.css'
})
export class ListartarefasComponent implements OnInit, OnDestroy {
  @Input() tarefas: Tarefa[] = [];
  @Input() titulo: string = 'Tarefas';
  @Output() fechar = new EventEmitter<void>();
  @Output() editar = new EventEmitter<Tarefa>();
  @Output() abrirTarefa = new EventEmitter<Tarefa>(); // se quiser abrir detalhe



  ngOnInit(): void {
    document.body.style.overflow = 'hidden';
  }

  ngOnDestroy(): void {
    document.body.style.overflow = '';
  }

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
