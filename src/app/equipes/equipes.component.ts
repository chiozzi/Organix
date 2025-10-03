import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-equipes',
  standalone: false,
  templateUrl: './equipes.component.html',
  styleUrls: ['./equipes.component.css']
})
export class EquipesComponent implements OnInit {
  equipes: any[] = [];
  mostrarModal = false;

  novaEquipe = {
    nome: '',
    lider: '',
    membrosInput: ''
  };

  detalhesEquipe: any = null;
  novoChecklist: string = '';
  novoComentario: string = '';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.carregarEquipes();
  }

  carregarEquipes() {
    this.http.get<any[]>('http://localhost:3000/equipes')
      .subscribe(dados => this.equipes = dados);
  }

  abrirModal() {
    this.mostrarModal = true;
  }

  fecharModal() {
    this.mostrarModal = false;
    this.novaEquipe = { nome: '', lider: '', membrosInput: '' };
  }

  criarEquipe() {
    const equipe = {
      nome: this.novaEquipe.nome,
      lider: this.novaEquipe.lider,
      membros: this.novaEquipe.membrosInput.split(',').map(m => m.trim()),
      etiqueta: 'afazer',
      descricao: '',
      checklist: [],
      comentarios: []
    };

    this.http.post('http://localhost:3000/equipes', equipe)
      .subscribe(() => {
        this.carregarEquipes();
        this.fecharModal();
      });
  }

  abrirDetalhes(equipe: any) {
    this.detalhesEquipe = {
      ...equipe,
      etiqueta: equipe.etiqueta || 'afazer',
      descricao: equipe.descricao || '',
      checklist: equipe.checklist || [],
      comentarios: equipe.comentarios || []
    };
  }

  fecharDetalhes() {
    this.detalhesEquipe = null;
  }

  adicionarChecklist() {
    if (this.novoChecklist.trim() !== '') {
      this.detalhesEquipe.checklist.push({ tarefa: this.novoChecklist, feito: false });
      this.novoChecklist = '';
    }
  }

  removerChecklistItem(i: number) {
    this.detalhesEquipe.checklist.splice(i, 1);
  }

  adicionarComentario() {
    if (this.novoComentario.trim() !== '') {
      this.detalhesEquipe.comentarios.push(this.novoComentario);
      this.novoComentario = '';
    }
  }

  salvarDetalhes() {
    this.http.put(`http://localhost:3000/equipes/${this.detalhesEquipe.id}`, this.detalhesEquipe)
      .subscribe(() => {
        this.carregarEquipes();
        this.fecharDetalhes();
      });
  }
}
