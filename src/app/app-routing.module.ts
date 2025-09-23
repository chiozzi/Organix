import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TarefasComponent } from './tarefas/tarefas.component';
import { HomeComponent } from './home/home.component';
import { CalendarioComponent } from './calendario/calendario.component';
import { EquipesComponent } from './equipes/equipes.component';
import { ChatComponent } from './chat/chat.component';
import { PerfilComponent } from './perfil/perfil.component';

const routes: Routes = [
  { path: '', component: HomeComponent }, // rota inicial
  { path: 'tarefas', component: TarefasComponent },
  { path: 'calendario', component: CalendarioComponent },
  { path: 'equipes', component: EquipesComponent },
  { path: 'chat', component: ChatComponent},
  { path: 'perfil', component: PerfilComponent},
  { path: '**', redirectTo: '' } // rota inválida -> Home
];



@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
