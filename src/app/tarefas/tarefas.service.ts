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
  prioridade?: 'baixa' | 'media' | 'alta';

  // Fluxo de execução (colunas do kanban)
  statusExecucao: 'nao_iniciado' | 'iniciado' | 'em_andamento' | 'concluido';

  // Condição (flag do card)
  condicao: 'pendente' | 'urgente' | 'atrasado' | 'normal';
}

@Injectable({
  providedIn: 'root'
})
export class TarefasService {
  private apiUrl = 'http://localhost:3000/tarefas';

  constructor(private http: HttpClient) {}

  // Listar todas as tarefas
  listar(): Observable<Tarefa[]> {
    return this.http.get<Tarefa[]>(this.apiUrl);
  }

  // Buscar tarefa por ID
  buscarPorId(id: number): Observable<Tarefa> {
    return this.http.get<Tarefa>(`${this.apiUrl}/${id}`);
  }

  // Criar nova tarefa
  criar(tarefa: Tarefa): Observable<Tarefa> {
    return this.http.post<Tarefa>(this.apiUrl, tarefa);
  }

  // Atualizar tarefa existente
  atualizar(id: number, tarefa: Tarefa): Observable<Tarefa> {
    return this.http.put<Tarefa>(`${this.apiUrl}/${id}`, tarefa);
  }

  // Remover tarefa por ID
  remover(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
