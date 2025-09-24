import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export enum StatusExecucao {
  AFazer = 'A Fazer',
  EmAtraso = 'Em Atraso',
  EmAndamento = 'Em Andamento',
  Concluido = 'Concluido' // <- padronizado
}

export enum Flag {
  Normal = 'Normal',
  Pendente = 'Pendente',
  Urgente = 'Urgente',
  Atrasado = 'Atrasado',
  Concluido = 'Concluído'  // ✅ novo valor
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

@Injectable({
  providedIn: 'root'
})
export class TarefasService {
  private readonly apiUrl = 'http://localhost:3000/tarefas';

  constructor(private http: HttpClient) {}

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

  remover(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  concluir(id: number, tarefa: Tarefa): Observable<Tarefa> {
    const concluida: Tarefa = {
      ...tarefa,
      statusExecucao: StatusExecucao.Concluido,
      flag: undefined
    };
    return this.atualizar(id, concluida);
  }
}
