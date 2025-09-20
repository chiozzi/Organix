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

  formTarefa!: FormGroup;

  constructor(private tarefasService: TarefasService) {}

  ngOnInit(): void {
    this.formTarefa = new FormGroup({
      titulo: new FormControl('', Validators.required),
      descricao: new FormControl(''),
      dataVencimento: new FormControl(''),
      membros: new FormControl(''),
      statusExecucao: new FormControl('A Fazer', Validators.required),
      flag: new FormControl('Normal', Validators.required)
    });
  }

  salvarTarefa(): void {
    if (this.formTarefa.invalid) return;

    const formValue = this.formTarefa.value;

    const novaTarefa: Tarefa = {
      titulo: formValue.titulo,
      descricao: formValue.descricao,
      dataVencimento: formValue.dataVencimento,
      membros: formValue.membros
        ? formValue.membros.split(',').map((m: string) => m.trim())
        : [],
      statusExecucao: formValue.statusExecucao,
      flag: formValue.flag
    };

    this.tarefasService.criar(novaTarefa).subscribe({
      next: (tarefaCriada) => {
        this.salvar.emit(tarefaCriada);  // envia para o pai
        this.fecharModal();
      },
      error: (err) => console.error('Erro ao criar tarefa:', err)
    });
  }

  cancelar(): void {
    this.fecharModal();
  }

  private fecharModal(): void {
    this.formTarefa.reset({
      statusExecucao: 'A Fazer',
      flag: 'Normal'
    });
    this.fechar.emit();
  }
}