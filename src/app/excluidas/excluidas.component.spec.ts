import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExcluidasComponent } from './excluidas.component';

describe('ExcluidasComponent', () => {
  let component: ExcluidasComponent;
  let fixture: ComponentFixture<ExcluidasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ExcluidasComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExcluidasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
