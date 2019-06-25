import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@app/domain';
import { Centre } from '@app/domain/centres';
import { CentreUI } from '@app/domain/centres/centre-ui.model';
import { CentreStoreActions, CentreStoreSelectors, RootStoreState } from '@app/root-store';
import { SpinnerStoreSelectors } from '@app/root-store/spinner';
import { LocationRemoveComponent } from '@app/shared/components/location-remove/location-remove.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { select, Store } from '@ngrx/store';
import { ToastrService } from 'ngx-toastr';
import { Observable, Subject, BehaviorSubject } from 'rxjs';
import { filter, map, shareReplay, takeUntil, tap, withLatestFrom } from 'rxjs/operators';

@Component({
  selector: 'app-centre-locations',
  templateUrl: './centre-locations.component.html',
  styleUrls: ['./centre-locations.component.scss']
})
export class CentreLocationsComponent implements OnInit, OnDestroy {

  isLoading$: Observable<boolean>;
  centre$: Observable<CentreUI>;

  private centreSubject = new BehaviorSubject(null);
  private updatedMessage$ = new Subject<string>();
  private unsubscribe$ = new Subject<void>();

  constructor(private store$: Store<RootStoreState.State>,
              private route: ActivatedRoute,
              private router: Router,
              private modalService: NgbModal,
              private toastr: ToastrService) { }

  ngOnInit() {
    this.centre$ = this.store$.pipe(
      select(CentreStoreSelectors.selectAllCentres),
      filter(s => s.length > 0),
      map((centres: Centre[]) => {
        const centreEntity = centres.find(s => s.slug === this.route.parent.parent.snapshot.params.slug);
        if (centreEntity) {
          const centre = (centreEntity instanceof Centre)
            ? centreEntity :  new Centre().deserialize(centreEntity);
          return new CentreUI(centre);
        }
        return undefined;
      }),
      shareReplay());

    this.centre$.pipe(takeUntil(this.unsubscribe$)).subscribe(this.centreSubject);
    this.isLoading$ = this.centre$.pipe(map(centre => centre === undefined));

    this.centre$.pipe(
      withLatestFrom(this.updatedMessage$),
      takeUntil(this.unsubscribe$)
    ).subscribe(([ centre, msg ]) => {
      this.toastr.success(msg, 'Update Successfull');
    });

    this.store$.pipe(
      select(CentreStoreSelectors.selectCentreError),
      filter(error => !!error),
      withLatestFrom(this.updatedMessage$),
      takeUntil(this.unsubscribe$)
    ).subscribe(([ error, _msg ]) => {
      const errMessage = error.error.error ? error.error.error.message : error.error.statusText;
      this.toastr.error(errMessage, 'Update Error', { disableTimeOut: true });
    });
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  addLocation(): void {
    this.whenCentreDisabled(() => {
      this.router.navigate([ 'add'  ], { relativeTo: this.route });
    });
  }

  edit(location: Location): void {
    this.whenCentreDisabled(() => {
      this.router.navigate([ location.id  ], { relativeTo: this.route });
    });
  }

  remove(location: Location): void {
    this.whenCentreDisabled(centre => {
      const modalRef = this.modalService.open(LocationRemoveComponent);
      modalRef.componentInstance.location = location;
      modalRef.result
        .then(() => {
          this.store$.dispatch(CentreStoreActions.updateCentreRequest({
            centre,
            attributeName: 'locationRemove',
            value: location
          }));

          this.updatedMessage$.next('Location removed');
        })
        .catch(() => undefined);
    });
  }

  private whenCentreDisabled(fn: (centre: Centre) => void) {
    const centre = this.centreSubject.value.entity;
    if (!centre.isDisabled()) {
      throw new Error('modifications not allowed');
    }

    fn(centre);
  }

}
