import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// Interface da tarefa
export interface Tarefa {
  id?: number;
  titulo: string;
  descricao?: string;
  membros?: string[];
  dataVencimento?: string;

  statusExecucao?: 'A Fazer' | 'Em Atraso' | 'Em Andamento' | 'Concluido';
  flag?: 'Normal' | 'Pendente' | 'Urgente' | 'Atrasado';
}

@Injectable({
  providedIn: 'root'
})
export class TarefasService {
  private readonly apiUrl = 'http://localhost:3000/tarefas';

  constructor(private http: HttpClient) {}

  /** Lista todas as tarefas */
  listar(): Observable<Tarefa[]> {
    return this.http.get<Tarefa[]>(this.apiUrl);
  }

  /** Busca tarefa pelo ID */
  buscarPorId(id: number): Observable<Tarefa> {
    return this.http.get<Tarefa>(`${this.apiUrl}/${id}`);
  }

  /** Cria nova tarefa */
  criar(tarefa: Tarefa): Observable<Tarefa> {
    return this.http.post<Tarefa>(this.apiUrl, tarefa);
  }

  /** Atualiza uma tarefa existente */
  atualizar(id: number, tarefa: Tarefa): Observable<Tarefa> {
    return this.http.put<Tarefa>(`${this.apiUrl}/${id}`, tarefa);
  }

  /** Remove tarefa pelo ID */
  remover(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  /** Marca a tarefa como concluída */
  concluir(id: number, tarefa: Tarefa): Observable<Tarefa> {
    const concluida: Tarefa = {
      ...tarefa,
      statusExecucao: 'Concluido',
      flag: undefined
    };
    return this.atualizar(id, concluida);
  }
}
