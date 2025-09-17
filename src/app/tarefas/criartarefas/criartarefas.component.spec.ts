import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CriartarefasComponent } from './criartarefas.component';

describe('CriartarefasComponent', () => {
  let component: CriartarefasComponent;
  let fixture: ComponentFixture<CriartarefasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CriartarefasComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CriartarefasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
