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
    membrosInput: '',
    dataPrazo: '',
    descricao: ''
  };
 
  detalhesEquipe: any = null;
  novoChecklist: string = '';
  novoComentario: string = '';
 
  constructor(private http: HttpClient) {}
 
  ngOnInit(): void {
    this.carregarEquipes();
  }
 
  carregarEquipes(): void {
    this.http.get<any>('http://localhost:3000/equipes').subscribe((data) => {
      this.equipes = data;
    });
  }
 
 
  abrirModal() {
    this.mostrarModal = true;
  }
 
  fecharModal() {
    this.mostrarModal = false;
    this.novaEquipe = { nome: '', lider: '', membrosInput: '', dataPrazo: '', descricao: '' };
  }
 
  criarEquipe() {
    if (!this.novaEquipe.nome || !this.novaEquipe.lider) {
      alert('Por favor, preencha o nome e o líder da equipe.');
      return;
    }
 
    const equipe = {
      nome: this.novaEquipe.nome,
      lider: this.novaEquipe.lider,
      membros: this.novaEquipe.membrosInput
        ? this.novaEquipe.membrosInput.split(',').map(m => m.trim())
        : [],
      etiqueta: 'afazer',
      descricao: this.novaEquipe.descricao || '',
      checklist: [],
      comentarios: [],
      dataCriacao: new Date(),
      dataPrazo: this.novaEquipe.dataPrazo || null
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
      const novo = {
        usuario: 'Usuário atual',
        texto: this.novoComentario,
        data: new Date()
      };
      this.detalhesEquipe.comentarios.push(novo);
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
 
  getProgresso(equipe: any): number {
    if (!equipe.checklist || equipe.checklist.length === 0) return 0;
    const feitos = equipe.checklist.filter((item: any) => item.feito).length;
    return (feitos / equipe.checklist.length) * 100;
  }
}
 
