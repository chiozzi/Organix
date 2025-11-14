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

  // modal de listagem
  mostrarListaModal: boolean = false;
  tarefasFiltradas: Tarefa[] = [];
  tituloModal: string = '';

  proximaReuniao = {
    titulo: 'Reunião de alinhamento',
    data: '21/09/2025',
    hora: '15:00',
    local: 'Google Meet'
  };

  notificacoes: { mensagem: string }[] = [
    { mensagem: 'Você tem 3 tarefas atrasadas.' },
    { mensagem: 'Projeto X foi atualizado.' },
    { mensagem: 'Você concluiu 5 tarefas esta semana! 🎉' },
    { mensagem: 'Uma nova reunião foi marcada para amanhã.' },
    { mensagem: 'Seu colega comentou em uma tarefa.' },
    { mensagem: 'Você recebeu 2 novas mensagens no chat.' }
  ];

  mensagens: { remetente: string; texto: string }[] = [
    { remetente: 'Ana', texto: 'Oi, pode revisar o documento?' },
    { remetente: 'Carlos', texto: 'Conseguiu ver o bug que comentei?' },
    { remetente: 'Marcos', texto: 'Qual o status do projeto?' },
    { remetente: 'Juliana', texto: 'Vamos marcar reunião para amanhã?' }
  ];


  exibirCriarTarefa = false;
  tarefaParaEdicao: Tarefa | null = null;

  constructor(private router: Router, private tarefasService: TarefasService) {}

  ngOnInit(): void {
    this.carregarTarefas();
  }

  private normaliza = (s?: any) =>
    s ? String(s).normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().toLowerCase() : '';

  carregarTarefas(): void {
    this.tarefasService.listar().subscribe(tarefas => {
      const hoje = new Date();
      const dia = String(hoje.getDate()).padStart(2, '0');
      const mes = String(hoje.getMonth() + 1).padStart(2, '0');
      const ano = hoje.getFullYear();
      const dataHoje = `${ano}-${mes}-${dia}`;

      this.tarefasHoje = tarefas.filter(t => t.dataVencimento === dataHoje);

      // atualiza stats (mesma lógica que você já tinha)
      this.stats[0].valor = tarefas.filter(t => this.normaliza(t.statusExecucao) === this.normaliza(StatusExecucao.EmAtraso)).length;
      this.stats[1].valor = tarefas.filter(t => this.normaliza(t.statusExecucao) === this.normaliza(StatusExecucao.AFazer)).length;
      this.stats[2].valor = tarefas.filter(t => this.normaliza(t.statusExecucao) === this.normaliza(StatusExecucao.EmAndamento)).length;
      this.stats[3].valor = tarefas.filter(t => this.normaliza(t.statusExecucao) === this.normaliza(StatusExecucao.Concluido)).length;
    });
  }

  abrirCriarModal(tarefa?: Tarefa) {
    this.tarefaParaEdicao = tarefa || null;
    this.exibirCriarTarefa = true;
  }

  tarefaCriadaOuAtualizada(event: Tarefa) {
    this.exibirCriarTarefa = false;
    this.carregarTarefas();
  }

  // novo: abre modal com tarefas do tipo
  irParaTarefasPorTipo(tipo: string) {
    // carrega tarefas e filtra localmente (evita navegação)
    this.tarefasService.listar().subscribe(tarefas => {
      const fazerKey = this.normaliza(StatusExecucao.AFazer);
      const andamentoKey = this.normaliza(StatusExecucao.EmAndamento);
      const concluidoKey = this.normaliza(StatusExecucao.Concluido);
      const atrasoKey = this.normaliza(StatusExecucao.EmAtraso);

      // normaliza cada tarefa
      const tarefasNorm = tarefas.map(t => ({ ...t, _statusNorm: this.normaliza(t.statusExecucao) }));

      switch (tipo) {
        case 'Atrasadas':
          // mostra EmAtraso + flag atrasado (mesma abordagem do kanban)
          this.tarefasFiltradas = tarefasNorm.filter(t =>
            [atrasoKey].includes(t._statusNorm) || t.flag === Flag.Atrasado
          );
          this.tituloModal = 'Tarefas Atrasadas';
          break;

        case 'Pendentes':
          this.tarefasFiltradas = tarefasNorm.filter(t => t._statusNorm === fazerKey);
          this.tituloModal = 'Tarefas Pendentes / A Fazer';
          break;

        case 'Em Andamento':
          this.tarefasFiltradas = tarefasNorm.filter(t => t._statusNorm === andamentoKey);
          this.tituloModal = 'Tarefas Em Andamento';
          break;

        case 'Concluídas':
          this.tarefasFiltradas = tarefasNorm.filter(t => t._statusNorm === concluidoKey);
          this.tituloModal = 'Tarefas Concluídas';
          break;

        default:
          this.tarefasFiltradas = [];
          this.tituloModal = 'Tarefas';
      }

      // finalmente abre o modal
      this.mostrarListaModal = true;
    });
  }

  fecharListaModal() {
    this.mostrarListaModal = false;
    this.tarefasFiltradas = [];
    this.tituloModal = '';
  }

  // se quiser abrir editar do modal
  onEditarFromModal(t: Tarefa) {
    this.fecharListaModal();
    this.abrirCriarModal(t);
  }

  irParaTarefas() { this.router.navigate(['/tarefas']); }
  irParaCalendario() { this.router.navigate(['/calendario']); }
  irParaEquipes() { this.router.navigate(['/equipes']); }
}






