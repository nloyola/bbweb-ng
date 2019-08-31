import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject, BehaviorSubject, Observable } from 'rxjs';
import { Store, select } from '@ngrx/store';
import { RootStoreState, CentreStoreSelectors, CentreStoreActions } from '@app/root-store';
import { filter, map, takeUntil, withLatestFrom, shareReplay, tap } from 'rxjs/operators';
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
  centre$: Observable<Centre>;
  centre: Centre;
  location: Location;
  locationToSave: Location;

  private updatedMessage$ = new Subject<string>();
  private unsubscribe$: Subject<void> = new Subject<void>();

  constructor(
    private store$: Store<RootStoreState.State>,
    private route: ActivatedRoute,
    private router: Router,
    private toastr: ToastrService
  ) {}

  ngOnInit() {
    this.centre$ = this.store$.pipe(
      select(CentreStoreSelectors.selectAllCentres),
      filter(s => s.length > 0),
      map((centres: Centre[]) => centres.find(s => s.slug === this.route.parent.parent.snapshot.params.slug)),
      filter(centre => centre !== undefined),
      map(centre => (centre instanceof Centre ? centre : new Centre().deserialize(centre))),
      tap(centre => {
        this.centre = centre;

        if (this.route.snapshot.params.locationId) {
          this.location = centre.locations.find(l => l.id === this.route.snapshot.params.locationId);
        } else {
          this.location = new Location();
        }
      }),
      shareReplay()
    );

    this.centre$
      .pipe(
        withLatestFrom(this.updatedMessage$),
        takeUntil(this.unsubscribe$)
      )
      .subscribe(([_centre, msg]) => {
        this.toastr.success(msg, 'Update Successfull');
        this.router.navigate(['..'], { relativeTo: this.route });
      });

    this.store$
      .pipe(
        select(CentreStoreSelectors.selectCentreError),
        filter(e => !!e),
        withLatestFrom(this.updatedMessage$),
        takeUntil(this.unsubscribe$)
      )
      .subscribe(([error, _msg]) => {
        let errMessage = error.error.error ? error.error.error.message : error.error.statusText;
        if (errMessage && errMessage.match(/EntityCriteriaError.*name already used/)) {
          errMessage = `The name is already in use: ${this.locationToSave.name}`;
        }
        this.toastr.error(errMessage, 'Add Error', { disableTimeOut: true });
      });
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  onSubmit(location: Location): void {
    this.locationToSave = location;
    this.store$.dispatch(
      CentreStoreActions.updateCentreRequest({
        centre: this.centre,
        attributeName: 'locationAdd',
        value: this.locationToSave
      })
    );

    this.updatedMessage$.next(this.location.isNew() ? 'Location Added' : 'Location Updated');
  }

  onCancel(): void {
    this.router.navigate(['..'], { relativeTo: this.route });
  }
}
