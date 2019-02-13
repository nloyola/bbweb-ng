import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@app/domain';
import { Centre } from '@app/domain/centres';
import { CentreUI } from '@app/domain/centres/centre-ui.model';
import { CentreStoreSelectors, RootStoreState, CentreStoreActions } from '@app/root-store';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { select, Store } from '@ngrx/store';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import { filter, map, takeUntil } from 'rxjs/operators';
import { LocationRemoveComponent } from '@app/shared/components/location-remove/location-remove.component';

@Component({
  selector: 'app-centre-locations',
  templateUrl: './centre-locations.component.html',
  styleUrls: ['./centre-locations.component.scss']
})
export class CentreLocationsComponent implements OnInit, OnDestroy {

  centre: CentreUI;
  updatedMessage: string;

  private unsubscribe$: Subject<void> = new Subject<void>();

  constructor(private store$: Store<RootStoreState.State>,
              private route: ActivatedRoute,
              private router: Router,
              private modalService: NgbModal,
              private toastr: ToastrService) { }

  ngOnInit() {
    this.store$.pipe(
      select(CentreStoreSelectors.selectAllCentres),
      filter(s => s.length > 0),
      map((centres: Centre[]) => centres.find(s => s.slug === this.route.parent.parent.snapshot.params.slug)),
      filter(centre => centre !== undefined),
      map(centre => (centre instanceof Centre) ? centre :  new Centre().deserialize(centre)),
      takeUntil(this.unsubscribe$))
      .subscribe(centre => {
        this.centre = new CentreUI(centre);

        if (this.updatedMessage) {
          this.toastr.success(this.updatedMessage, 'Update Successfull');
        }
      });

    this.store$
      .pipe(
        select(CentreStoreSelectors.selectCentreError),
        filter(s => !!s),
        takeUntil(this.unsubscribe$))
      .subscribe((error: any) => {
        const errMessage = error.error ? error.error.message : error.statusText;
        this.toastr.error(errMessage, 'Update Error', { disableTimeOut: true });
      });
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  addLocation(): void {
    if (!this.centre.isDisabled()) {
      throw new Error('modifications not allowed');
    }
    this.router.navigate([ 'add'  ], { relativeTo: this.route });
  }

  edit(location: Location): void {
    if (!this.centre.isDisabled()) {
      throw new Error('modifications not allowed');
    }
    this.router.navigate([ location.id  ], { relativeTo: this.route });
  }

  remove(location: Location): void {
    if (!this.centre.isDisabled()) {
      throw new Error('modifications not allowed');
    }

    const modalRef = this.modalService.open(LocationRemoveComponent);
    modalRef.componentInstance.location = location;
    modalRef.result
      .then(() => {
        this.store$.dispatch(new CentreStoreActions.UpdateCentreRemoveLocationRequest({
          centre: this.centre.entity,
          locationId: location.id
        }));

        this.updatedMessage = 'Location removed';
      })
      .catch(() => undefined);
  }

}
