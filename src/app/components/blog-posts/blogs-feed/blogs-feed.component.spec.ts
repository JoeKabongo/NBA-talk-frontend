import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BlogsFeedComponent } from './blogs-feed.component';

describe('BlogsFeedComponent', () => {
  let component: BlogsFeedComponent;
  let fixture: ComponentFixture<BlogsFeedComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BlogsFeedComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BlogsFeedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
