import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VertarefasComponent } from './vertarefas.component';

describe('VertarefasComponent', () => {
  let component: VertarefasComponent;
  let fixture: ComponentFixture<VertarefasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [VertarefasComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VertarefasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
