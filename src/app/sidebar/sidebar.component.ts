import { Component } from '@angular/core';

@Component({
  selector: 'app-sidebar',
  standalone: false,
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent {

  isOpen = false; // ou true se quiser iniciar aberta
  activeItem?: string;

  toggleSidebar() {
    this.isOpen = !this.isOpen;
    document.body.classList.toggle('sidebar-collapsed', !this.isOpen);
  }

  setActive(item: string, event?: Event) {
    if (event) {
      event.preventDefault();
    }
    this.activeItem = item;
  }
}