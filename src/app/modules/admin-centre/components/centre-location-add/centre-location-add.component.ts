import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject, BehaviorSubject } from 'rxjs';
import { Store, select } from '@ngrx/store';
import { RootStoreState, CentreStoreSelectors, CentreStoreActions } from '@app/root-store';
import { filter, map, takeUntil } from 'rxjs/operators';
import { Centre } from '@app/domain/centres';
import { Location } from '@app/domain';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-centre-location-add',
  templateUrl: './centre-location-add.component.html',
  styleUrls: ['./centre-location-add.component.scss']
})
export class CentreLocationAddComponent implements OnInit, OnDestroy {

  centre: Centre;
  location: Location;
  locationToSave: Location;
  savedMessage: string;
  isSaving$ = new BehaviorSubject<boolean>(false);

  private unsubscribe$: Subject<void> = new Subject<void>();

  constructor(private store$: Store<RootStoreState.State>,
              private route: ActivatedRoute,
              private router: Router,
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
        this.centre = centre;

        if (this.route.snapshot.params.locationId) {
          this.location = centre.locations.find(l => l.id === this.route.snapshot.params.locationId);
        } else {
          this.location = new Location();
        }

        if (this.savedMessage) {
          this.isSaving$.next(false);
          this.toastr.success(this.savedMessage, 'Update Successfull');
          this.router.navigate([ '..' ], { relativeTo: this.route });
        }
      });

    this.store$
      .pipe(
        select(CentreStoreSelectors.selectCentreError),
        filter(e => !!e),
        takeUntil(this.unsubscribe$))
      .subscribe((error: any) => {
        this.isSaving$.next(false);

        let errMessage = error.error.error ? error.error.error.message : error.error.statusText;
        if (errMessage && errMessage.match(/EntityCriteriaError.*name already used/)) {
          errMessage = `The name is already in use: ${this.locationToSave.name}`;
        }
        this.toastr.error(errMessage, 'Add Error', { disableTimeOut: true });
        this.savedMessage = undefined;
   });
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  onSubmit(location: Location): void {
    this.isSaving$.next(true);
    this.locationToSave = location;
    this.store$.dispatch(
      new CentreStoreActions.UpdateCentreAddOrUpdateLocationRequest({
        centre: this.centre,
        location: this.locationToSave
      }));

    this.savedMessage = this.location.isNew()
      ? 'Location Added' : 'Location Updated';
  }

  onCancel(): void {
    this.router.navigate([ '..' ], { relativeTo: this.route });
  }

}
