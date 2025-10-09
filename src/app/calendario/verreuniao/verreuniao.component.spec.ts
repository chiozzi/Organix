import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VerreuniaoComponent } from './verreuniao.component';

describe('VerreuniaoComponent', () => {
  let component: VerreuniaoComponent;
  let fixture: ComponentFixture<VerreuniaoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [VerreuniaoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VerreuniaoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
