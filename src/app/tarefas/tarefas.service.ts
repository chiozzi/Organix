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
  Concluido = 'Concluído'
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

  private atualizarFlag(tarefa: Tarefa, forcarStatus?: StatusExecucao): Tarefa {
  // 🔹 Se o status foi forçado pelo card, usamos ele
  let status = forcarStatus ?? tarefa.statusExecucao;

  // 🔹 Se está concluído, sempre mantém flag de concluído
  if (status === StatusExecucao.Concluido) {
    return { ...tarefa, statusExecucao: status, flag: Flag.Concluido };
  }

  if (!tarefa.dataVencimento) {
    return { ...tarefa, statusExecucao: status, flag: Flag.Normal };
  }

  const hoje = new Date();
  const vencimento = new Date(tarefa.dataVencimento);
  const diffDias = Math.floor((vencimento.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
  const diffMeses = diffDias / 30;

  // 🔹 Regras de flag pela data
  if (diffMeses >= 1) {
    return { ...tarefa, statusExecucao: status, flag: Flag.Normal };
  }
  if (diffDias < 0) {
    return { ...tarefa, statusExecucao: StatusExecucao.EmAtraso, flag: Flag.Atrasado };
  }
  if (diffDias === 0) {
    return { ...tarefa, statusExecucao: StatusExecucao.EmAndamento, flag: Flag.Urgente };
  }
  return { ...tarefa, statusExecucao: StatusExecucao.AFazer, flag: Flag.Pendente };
}


  listar(): Observable<Tarefa[]> {
    return this.http.get<Tarefa[]>(this.apiUrl).pipe(
      map(tarefas => tarefas.map(t => this.atualizarFlag(t)))
    );
  }

  buscarPorId(id: number): Observable<Tarefa> {
    return this.http.get<Tarefa>(`${this.apiUrl}/${id}`).pipe(
      map(t => this.atualizarFlag(t))
    );
  }

  criar(tarefa: Tarefa): Observable<Tarefa> {
    const tarefaAtualizada = this.atualizarFlag(tarefa);
    return this.http.post<Tarefa>(this.apiUrl, tarefaAtualizada);
  }

  atualizar(id: number, tarefa: Tarefa): Observable<Tarefa> {
    const tarefaAtualizada = this.atualizarFlag(tarefa);
    return this.http.put<Tarefa>(`${this.apiUrl}/${id}`, tarefaAtualizada);
  }

  remover(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
