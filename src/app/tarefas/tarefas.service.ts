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
  horaVencimento: string;
  statusExecucao: StatusExecucao;
  flag: Flag;
  ordem: number;
  removendo?: boolean;      // ❗ usado APENAS no front
  _statusNorm?: string;     // ❗ usado APENAS no front
}

@Injectable({ providedIn: 'root' })
export class TarefasService {
  private apiUrl = 'http://localhost:3000/tarefas';

  constructor(private http: HttpClient) {}

  /** 
   * Remove todos os campos que NÃO devem ir para o backend 
   */
  private limparCamposInternos(tarefa: Tarefa): Tarefa {
    const copia = { ...tarefa };
    delete (copia as any)._statusNorm;
    delete (copia as any).removendo;
    return copia;
  }

  listar(): Observable<Tarefa[]> {
    return this.http.get<Tarefa[]>(this.apiUrl);
  }

  criar(tarefa: Tarefa): Observable<Tarefa> {
    return this.http.post<Tarefa>(this.apiUrl, this.limparCamposInternos(tarefa));
  }

  atualizar(id: number, tarefa: Tarefa): Observable<Tarefa> {
    return this.http.put<Tarefa>(`${this.apiUrl}/${id}`, this.limparCamposInternos(tarefa));
  }

  remover(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  atualizarOrdem(id: number, ordem: number): Observable<Tarefa> {
    return this.http.patch<Tarefa>(`${this.apiUrl}/${id}`, { ordem });
  }
}
