import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { NgbActiveModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { UserRemoveModalComponent } from './user-remove-modal.component';
import { ModalComponent } from '../modal/modal.component';
import { Factory } from '@test/factory';
import { User } from '@app/domain/users';

describe('RoleUserRemoveComponent', () => {
  let component: UserRemoveModalComponent;
  let fixture: ComponentFixture<UserRemoveModalComponent>;
  const factory = new Factory();

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [NgbModule],
      providers: [NgbActiveModal],
      declarations: [UserRemoveModalComponent, ModalComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserRemoveModalComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    component.user = new User().deserialize(factory.user());
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });
});
