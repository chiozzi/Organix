import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListartarefasComponent } from './listartarefas.component';

describe('ListartarefasComponent', () => {
  let component: ListartarefasComponent;
  let fixture: ComponentFixture<ListartarefasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ListartarefasComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListartarefasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
