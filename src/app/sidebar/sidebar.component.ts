import { Component } from '@angular/core';

@Component({
  selector: 'app-sidebar',
  standalone: false,
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent {
  isOpen = false;
  activeItem?: string; // sem valor inicial

  toggleSidebar() {
    this.isOpen = !this.isOpen;

    // Adiciona ou remove a classe no body para ajustar o main
    document.body.classList.toggle('sidebar-collapsed', !this.isOpen);
  }

  setActive(item: string, event?: Event) {
    if (event) {
      event.preventDefault(); // evita scroll pro topo com href="#"
    }
    this.activeItem = item;
  }
}