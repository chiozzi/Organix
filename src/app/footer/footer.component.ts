import { Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  standalone: false,
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css'
})
export class FooterComponent {
  // Controle dos modais
  exibirSobreNos = false;
  exibirPolitica = false;
  exibirTermos = false;
  exibirCookies = false;
  exibirFAQ = false;
  exibirCentralAjuda = false;

  abrirModal(modal: string, event: Event) {
    event.preventDefault();
    switch(modal) {
      case 'sobre': this.exibirSobreNos = true; break;
      case 'politica': this.exibirPolitica = true; break;
      case 'termos': this.exibirTermos = true; break;
      case 'cookies': this.exibirCookies = true; break;
      case 'faq': this.exibirFAQ = true; break;
      case 'central': this.exibirCentralAjuda = true; break;
    }
  }

  fecharModal(modal: string) {
    switch(modal) {
      case 'sobre': this.exibirSobreNos = false; break;
      case 'politica': this.exibirPolitica = false; break;
      case 'termos': this.exibirTermos = false; break;
      case 'cookies': this.exibirCookies = false; break;
      case 'faq': this.exibirFAQ = false; break;
      case 'central': this.exibirCentralAjuda = false; break;
    }
  }
}

