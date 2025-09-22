import { Component } from '@angular/core';

@Component({
  selector: 'app-home',
  standalone: false,
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  usuario = 'Bruno';

  // Notificações (todas azuis)
  notificacoes = [
    { mensagem: 'Você tem 3 tarefas atrasadas.' },
    { mensagem: 'Projeto X foi atualizado.' },
    { mensagem: 'Você concluiu 5 tarefas esta semana! 🎉' },
    { mensagem: 'Uma nova reunião foi marcada para amanhã.' },
    { mensagem: 'Seu colega comentou em uma tarefa.' },
    { mensagem: 'Você recebeu 2 novas mensagens no chat.' }
  ];

  // Atalhos rápidos
  atalhos = [
    { titulo: 'Nova Tarefa', icone: 'fa fa-plus', rota: '/tarefas' },
    { titulo: 'Nova Reunião', icone: 'fa fa-handshake', rota: '/reunioes' },
    { titulo: 'Calendário', icone: 'fa fa-calendar', rota: '/calendario' },
    { titulo: 'Chat', icone: 'fa fa-comments', rota: '/chat' }
  ];

  // Estatísticas (reformulado)
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

  // Novas mensagens
  mensagens = [
    { remetente: 'Ana', texto: 'Oi, pode revisar o documento?' },
    { remetente: 'Carlos', texto: 'Conseguiu ver o bug que comentei?' }
  ];
}