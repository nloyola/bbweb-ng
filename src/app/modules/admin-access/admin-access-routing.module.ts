import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '@app/core/guards';
import { AccessAdminComponent } from './components/access-admin/access-admin.component';
import { RoleViewComponent } from './components/role-view/role-view.component';
import { RolesAdminComponent } from './components/roles-admin/roles-admin.component';
import { UserProfileComponent } from './components/user-profile/user-profile.component';
import { UsersAdminComponent } from './components/users-admin/users-admin.component';
import { MembershipsAdminComponent } from './components/memberships-admin/memberships-admin.component';
import { MembershipViewComponent } from './components/membership-view/membership-view.component';
import { MembershipAddComponent } from './components/membership-add/membership-add.component';
import { UserResolver, RoleResolver, MembershipResolver } from '@app/core/resolvers';

export const routes: Routes = [
  {
    path: 'access',
    canActivate: [AuthGuard],
    data: {
      breadcrumbs: 'Users'
    },
    children: [
      {
        path: '',
        component: AccessAdminComponent
      },
      {
        path: 'users',
        data: {
          breadcrumbs: 'Current Users'
        },
        children: [
          {
            path: '',
            component: UsersAdminComponent
          },
          {
            path: ':slug',
            resolve: {
              user: UserResolver
            },
            component: UserProfileComponent,
            data: {
              breadcrumbs: '{{ user.name }}'
            }
          }
        ]
      },
      {
        path: 'roles',
        data: {
          breadcrumbs: 'Roles'
        },
        children: [
          {
            path: '',
            component: RolesAdminComponent
          },
          {
            path: ':slug',
            resolve: {
              role: RoleResolver
            },
            component: RoleViewComponent,
            data: {
              breadcrumbs: '{{ role.name }}'
            }
          }
        ]
      },
      {
        path: 'memberships',
        data: {
          breadcrumbs: 'Memberships'
        },
        children: [
          {
            path: '',
            component: MembershipsAdminComponent
          },
          {
            path: 'add',
            component: MembershipAddComponent,
            data: {
              breadcrumbs: 'Add'
            }
          },
          {
            path: ':slug',
            resolve: {
              membership: MembershipResolver
            },
            component: MembershipViewComponent,
            data: {
              breadcrumbs: '{{ membership.name }}'
            }
          }
        ]
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminAccessRoutingModule {}
