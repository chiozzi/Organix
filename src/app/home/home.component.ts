import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: false,
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  usuario = 'Bruno';

  constructor(private router: Router) {}

  // Funções de navegação
  irParaTarefas() { this.router.navigate(['/tarefas']); }
  irParaCalendario() { this.router.navigate(['/calendario']); }
  irParaEquipes() { this.router.navigate(['/equipes']); }

  // Estatísticas
  stats = [
    { titulo: 'Concluídas', valor: 12, icone: 'fa fa-check-circle', cor: '#4caf50' },
    { titulo: 'Atrasadas', valor: 3, icone: 'fa fa-exclamation-triangle', cor: '#f44336' },
    { titulo: 'Pendentes', valor: 8, icone: 'fa fa-clock', cor: '#ffc107' }
  ];

  // Tarefas de hoje
  tarefasHoje = [
    { titulo: 'Finalizar relatório do projeto', hora: '10:00' },
    { titulo: 'Revisar backlog com a equipe', hora: '14:00' },
    { titulo: 'Enviar apresentação ao cliente', hora: '17:30' }
  ];

  // Próxima reunião
  proximaReuniao = {
    titulo: 'Reunião de alinhamento',
    data: '21/09/2025',
    hora: '15:00',
    local: 'Google Meet'
  };

  // Notificações
  notificacoes = [
    { mensagem: 'Você tem 3 tarefas atrasadas.' },
    { mensagem: 'Projeto X foi atualizado.' },
    { mensagem: 'Você concluiu 5 tarefas esta semana! 🎉' },
    { mensagem: 'Uma nova reunião foi marcada para amanhã.' },
    { mensagem: 'Seu colega comentou em uma tarefa.' },
    { mensagem: 'Você recebeu 2 novas mensagens no chat.' }
  ];

  // Mensagens
  mensagens = [
    { remetente: 'Ana', texto: 'Oi, pode revisar o documento?' },
    { remetente: 'Carlos', texto: 'Conseguiu ver o bug que comentei?' },
    { remetente: 'Marcos', texto: 'Qual o status do projeto?' },
    { remetente: 'Juliana', texto: 'Vamos marcar reunião para amanhã?' },
    { remetente: 'Felipe', texto: 'Recebi seu e-mail, obrigado!' }
  ];
}
