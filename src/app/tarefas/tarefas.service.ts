import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';

export enum StatusExecucao {
  AFazer = 'A Fazer',
  EmAtraso = 'Em Atraso',
  EmAndamento = 'Em Andamento',
  Concluido = 'Concluido'
}

export enum Flag {
  Normal = 'Normal',
  Pendente = 'Pendente',
  Urgente = 'Urgente',
  Atrasado = 'Atrasado',
  Concluido = 'Concluido'
}

export interface Tarefa {
  id?: number;
  titulo: string;
  descricao?: string;
  membros?: string[];
  dataVencimento?: string;
  statusExecucao?: StatusExecucao;
  flag?: Flag;
}

@Injectable({ providedIn: 'root' })
export class TarefasService {
  private readonly apiUrl = 'http://localhost:3000/tarefas';

  constructor(private http: HttpClient) {}

  // 🔹 Apenas listar, sem recalcular flag/status
  listar(): Observable<Tarefa[]> {
    return this.http.get<Tarefa[]>(this.apiUrl);
  }

  buscarPorId(id: number): Observable<Tarefa> {
    return this.http.get<Tarefa>(`${this.apiUrl}/${id}`);
  }

  criar(tarefa: Tarefa): Observable<Tarefa> {
    return this.http.post<Tarefa>(this.apiUrl, tarefa);
  }

  atualizar(id: number, tarefa: Tarefa): Observable<Tarefa> {
    return this.http.put<Tarefa>(`${this.apiUrl}/${id}`, tarefa);
  }

  // 🔹 Atualiza apenas o STATUS, sem mexer nas flags
  atualizarStatus(id: number, novoStatus: StatusExecucao): Observable<Tarefa> {
    return this.http.patch<Tarefa>(`${this.apiUrl}/${id}`, { statusExecucao: novoStatus });
  }

  remover(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
