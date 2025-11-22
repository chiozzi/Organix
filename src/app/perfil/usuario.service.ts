import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

/* =============================
   ENUMS
============================= */

export enum PerfilUsuario {
  Admin = 'Admin',
  Cliente = 'Cliente',
  Suporte = 'Suporte'
}

export enum StatusUsuario {
  Ativo = 'Ativo',
  Inativo = 'Inativo',
  Banido = 'Banido'
}

/* =============================
   MODEL DO USUÁRIO
============================= */

export interface Usuario {
  id?: number;
  nome: string;
  email: string;
  senha: string;
  perfil: PerfilUsuario;
  status: StatusUsuario;
  criadoEm: string;
  avatarUrl?: string; // ✅ Adicionei aqui
  removendo?: boolean;
  _badgeStatus?: string;
}


/* =============================
   SERVICE
============================= */

@Injectable({ providedIn: 'root' })
export class UsuarioService {
  private apiUrl = 'http://localhost:3000/usuarios';

  constructor(private http: HttpClient) {}

  /* =============================
     Remove campos internos ⚠️
  ============================== */
  private limparCamposInternos(usuario: Usuario): Usuario {
    const copia = { ...usuario };
    delete (copia as any).removendo;
    delete (copia as any)._badgeStatus;
    return copia;
  }

  /* =============================
     CRUD COMPLETÃO
  ============================== */

  listar(): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(this.apiUrl);
  }

  criar(usuario: Usuario): Observable<Usuario> {
    return this.http.post<Usuario>(this.apiUrl, this.limparCamposInternos(usuario));
  }

  atualizar(id: number, usuario: Usuario): Observable<Usuario> {
    return this.http.put<Usuario>(`${this.apiUrl}/${id}`, this.limparCamposInternos(usuario));
  }

  atualizarParcial(id: number, dados: Partial<Usuario>): Observable<Usuario> {
    return this.http.patch<Usuario>(`${this.apiUrl}/${id}`, dados);
  }

  remover(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
