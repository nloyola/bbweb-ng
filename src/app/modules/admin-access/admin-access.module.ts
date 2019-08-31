import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CentreRemoveModalComponent } from '@app/modules/modals/components/centre-remove-modal/centre-remove-modal.component';
import { StudyRemoveModalComponent } from '@app/modules/modals/components/study-remove-modal/study-remove-modal.component';
import { UserRemoveModalComponent } from '@app/modules/modals/components/user-remove-modal/user-remove-modal.component';
import { ModalInputModule } from '@app/modules/modals/modals.module';
import { SharedModule } from '@app/shared/shared.module';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { MaterialModule } from '../material.module';
import { AdminAccessRoutingModule } from './admin-access-routing.module';
import { AccessAdminComponent } from './components/access-admin/access-admin.component';
import { MembershipAddComponent } from './components/membership-add/membership-add.component';
import { MembershipViewComponent } from './components/membership-view/membership-view.component';
import { MembershipsAdminComponent } from './components/memberships-admin/memberships-admin.component';
import { MembershipsViewComponent } from './components/memberships-view/memberships-view.component';
import { RoleViewComponent } from './components/role-view/role-view.component';
import { RolesAdminComponent } from './components/roles-admin/roles-admin.component';
import { RolesViewComponent } from './components/roles-view/roles-view.component';
import { UserCountsComponent } from './components/user-counts/user-counts.component';
import { UserProfileComponent } from './components/user-profile/user-profile.component';
import { UsersAdminComponent } from './components/users-admin/users-admin.component';
import { UsersViewComponent } from './components/users-view/users-view.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialModule,
    FontAwesomeModule,
    SharedModule,
    NgbModule,
    ModalInputModule,
    AdminAccessRoutingModule
  ],
  declarations: [
    AccessAdminComponent,
    UsersViewComponent,
    UserCountsComponent,
    UsersAdminComponent,
    UserProfileComponent,
    RolesAdminComponent,
    RolesViewComponent,
    RoleViewComponent,
    MembershipsAdminComponent,
    MembershipsViewComponent,
    MembershipViewComponent,
    MembershipAddComponent
  ],
  entryComponents: [UserRemoveModalComponent, StudyRemoveModalComponent, CentreRemoveModalComponent]
})
export class AdminAccessModule {}
