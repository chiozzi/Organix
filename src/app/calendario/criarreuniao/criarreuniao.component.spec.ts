import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CriarreuniaoComponent } from './criarreuniao.component';

describe('CriarreuniaoComponent', () => {
  let component: CriarreuniaoComponent;
  let fixture: ComponentFixture<CriarreuniaoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CriarreuniaoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CriarreuniaoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
