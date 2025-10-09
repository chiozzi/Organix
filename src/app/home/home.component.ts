import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Flag, StatusExecucao, Tarefa, TarefasService } from '../tarefas/tarefas.service';

@Component({
  selector: 'app-home',
  standalone: false,
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {
  usuario = 'Bruno';

  tarefasHoje: Tarefa[] = [];
  stats = [
    { titulo: 'Atrasadas', valor: 0, icone: 'fa fa-exclamation-triangle', cor: '#ff1111' },
    { titulo: 'Pendentes', valor: 0, icone: 'fa fa-clock', cor: '#ff6600' },
    { titulo: 'Em Andamento', valor: 0, icone: 'fa fa-hourglass-half', cor: '#ffee07' },
    { titulo: 'Concluídas', valor: 0, icone: 'fa fa-check-circle', cor: '#2fa533' },
  ];

  proximaReuniao = {
    titulo: 'Reunião de alinhamento',
    data: '21/09/2025',
    hora: '15:00',
    local: 'Google Meet'
  };

  notificacoes = [
    { mensagem: 'Você tem 3 tarefas atrasadas.' },
    { mensagem: 'Projeto X foi atualizado.' },
    { mensagem: 'Você concluiu 5 tarefas esta semana! 🎉' },
    { mensagem: 'Uma nova reunião foi marcada para amanhã.' },
    { mensagem: 'Seu colega comentou em uma tarefa.' },
    { mensagem: 'Você recebeu 2 novas mensagens no chat.' }
  ];

  mensagens = [
    { remetente: 'Ana', texto: 'Oi, pode revisar o documento?' },
    { remetente: 'Carlos', texto: 'Conseguiu ver o bug que comentei?' },
    { remetente: 'Marcos', texto: 'Qual o status do projeto?' },
    { remetente: 'Juliana', texto: 'Vamos marcar reunião para amanhã?' },
  ];

  // 🔹 Controle do modal de criar tarefas
  exibirCriarTarefa = false;
  tarefaParaEdicao: Tarefa | null = null;

  constructor(private router: Router, private tarefasService: TarefasService) {}

  ngOnInit(): void {
    this.carregarTarefas();
  }

  /** Busca tarefas do backend e atualiza estatísticas + tarefas de hoje */
  carregarTarefas(): void {
    this.tarefasService.listar().subscribe(tarefas => {
      const hoje = new Date().toDateString();

      // Filtra tarefas do dia atual
      this.tarefasHoje = tarefas.filter(t => {
        const dataVenc = new Date(t.dataVencimento).toDateString();
        return dataVenc === hoje;
      });

      // Atualiza estatísticas
      this.stats[0].valor = tarefas.filter(t => t.statusExecucao === StatusExecucao.EmAtraso).length;
      this.stats[1].valor = tarefas.filter(t => t.statusExecucao === StatusExecucao.AFazer).length;
      this.stats[2].valor = tarefas.filter(t => t.statusExecucao === StatusExecucao.EmAndamento).length;
      this.stats[3].valor = tarefas.filter(t => t.statusExecucao === StatusExecucao.Concluido).length;
    });
  }

  /** 🔹 Abre o modal de criar/editar tarefa */
  abrirCriarModal(tarefa?: Tarefa) {
    this.tarefaParaEdicao = tarefa || null;
    this.exibirCriarTarefa = true;
  }

  /** 🔹 Fecha o modal e recarrega a lista */
  tarefaCriadaOuAtualizada(event: Tarefa) {
    this.exibirCriarTarefa = false;
    this.carregarTarefas(); // Atualiza tarefas e estatísticas
  }

  irParaTarefasPorTipo(tipo: string) {
    let id = '';

    switch (tipo) {
      case 'Atrasadas':
        id = 'atraso';
        break;
      case 'Pendentes':
        id = 'afazer';
        break;
      case 'Em Andamento':
        id = 'emandamento';
        break;
      case 'Concluídas':
        id = 'concluidas';
        break;
    }

    this.router.navigate(['/tarefas'], { fragment: id });
  }

  // 🔹 Navegação original
  irParaTarefas() { this.router.navigate(['/tarefas']); }
  irParaCalendario() { this.router.navigate(['/calendario']); }
  irParaEquipes() { this.router.navigate(['/equipes']); }
}



