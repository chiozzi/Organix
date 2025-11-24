import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ArquivadasComponent } from './arquivadas.component';

describe('ArquivadasComponent', () => {
  let component: ArquivadasComponent;
  let fixture: ComponentFixture<ArquivadasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ArquivadasComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ArquivadasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
