import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export enum StatusExecucao {
  AFazer = 'A Fazer',
  EmAtraso = 'Em Atraso',
  EmAndamento = 'Em Andamento',
  Concluido = 'Concluído'
}


export enum Flag {
  Normal = 'Normal',
  Urgente = 'Urgente',
  Pendente = 'Pendente',
  Atrasado = 'Atrasado',
  Concluido = 'Concluido'
}

export interface Tarefa {
  id?: number;
  titulo: string;
  descricao: string;
  dataVencimento: string;
  horaVencimento: string; // <-- novo campo
  statusExecucao: StatusExecucao;
  flag: Flag; // continua existindo, mas é definida automaticamente
  ordem: number;
}


@Injectable({ providedIn: 'root' })
export class TarefasService {
  private apiUrl = 'http://localhost:3000/tarefas';

  constructor(private http: HttpClient) {}

  listar(): Observable<Tarefa[]> {
    return this.http.get<Tarefa[]>(this.apiUrl);
  }

  criar(tarefa: Tarefa): Observable<Tarefa> {
    return this.http.post<Tarefa>(this.apiUrl, tarefa);
  }

  atualizar(id: number, tarefa: Tarefa): Observable<Tarefa> {
    return this.http.put<Tarefa>(`${this.apiUrl}/${id}`, tarefa);
  }

  remover(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  atualizarOrdem(id: number, ordem: number): Observable<Tarefa> {
    return this.http.patch<Tarefa>(`${this.apiUrl}/${id}`, { ordem });
  }
}
