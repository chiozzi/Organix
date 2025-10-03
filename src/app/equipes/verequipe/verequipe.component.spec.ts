import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VerequipeComponent } from './verequipe.component';

describe('VerequipeComponent', () => {
  let component: VerequipeComponent;
  let fixture: ComponentFixture<VerequipeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [VerequipeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VerequipeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
