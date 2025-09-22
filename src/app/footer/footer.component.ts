import { Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  standalone: false,
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css'
})
export class FooterComponent {
 exibirSobreNos = false;

  abrirSobreNos(event: Event) {
    event.preventDefault(); // impede reload da página
    this.exibirSobreNos = true;
  }

  fecharSobreNos() {
    this.exibirSobreNos = false;
  }
}