import { Component, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NotificationService } from '@app/core/services';
import { Annotation, AnnotationFactory } from '@app/domain/annotations';
import { Participant } from '@app/domain/participants';
import { Study } from '@app/domain/studies';
import { ModalInputTextOptions } from '@app/modules/modals/models';
import {
  ParticipantStoreActions,
  ParticipantStoreSelectors,
  RootStoreState,
  StudyStoreActions,
  StudyStoreSelectors
} from '@app/root-store';
import { DropdownMenuItem } from '@app/shared/components/dropdown-menu/dropdown-menu.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Dictionary } from '@ngrx/entity';
import { createSelector, select, Store } from '@ngrx/store';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { map, shareReplay, takeUntil, tap, filter } from 'rxjs/operators';

interface EntityData {
  participant: Participant;
  study: Study;
}

@Component({
  selector: 'app-participant-summary',
  templateUrl: './participant-summary.component.html',
  styleUrls: ['./participant-summary.component.scss']
})
export class ParticipantSummaryComponent implements OnInit, OnDestroy {
  @ViewChild('updateUniqueIdModal', { static: false }) updateUniqueIdModal: TemplateRef<any>;
  @ViewChild('updateAnnotationModal', { static: false }) updateAnnotationModal: TemplateRef<any>;

  entities$: Observable<EntityData>;
  participant$: Observable<Participant>;
  annotations$: Observable<Annotation[]>;
  annotationToEdit: Annotation;

  uniqueIdModalOptions: ModalInputTextOptions = {
    required: true,
    minLength: 2
  };

  annotationModalOptions: ModalInputTextOptions = {};
  menuItems: DropdownMenuItem[];

  private newUniqueId: string;
  private entitiesSubject = new BehaviorSubject(null);
  private unsubscribe$ = new Subject<void>();

  constructor(
    private store$: Store<RootStoreState.State>,
    private router: Router,
    private route: ActivatedRoute,
    private modalService: NgbModal,
    private notificationService: NotificationService
  ) {}

  ngOnInit() {
    const entitiesSelector = createSelector(
      ParticipantStoreSelectors.selectAllParticipantEntities,
      StudyStoreSelectors.selectAllStudyEntities,
      (participants: Dictionary<Participant>, studies: Dictionary<Study>): EntityData => {
        const participantEntity = participants[this.route.parent.snapshot.data.participant.id];
        if (participantEntity !== undefined) {
          const participant =
            participantEntity instanceof Participant
              ? participantEntity
              : new Participant().deserialize(participantEntity);

          return {
            participant,
            study: this.studyFromId(participant.study.id, studies)
          };
        }

        return undefined;
      }
    );

    this.entities$ = this.store$.pipe(
      select(entitiesSelector),
      tap(entities => {
        if (entities === undefined) {
          return;
        }

        if (entities.study === undefined || entities.study.timeAdded === undefined) {
          this.store$.dispatch(StudyStoreActions.getStudyRequest({ slug: entities.participant.study.slug }));
        }
      }),
      takeUntil(this.unsubscribe$),
      shareReplay()
    );

    this.entities$.pipe(takeUntil(this.unsubscribe$)).subscribe(this.entitiesSubject);
    this.participant$ = this.entities$.pipe(map(entities => (entities ? entities.participant : undefined)));

    this.annotations$ = this.entities$.pipe(
      map(entities => {
        if (entities === undefined || entities.study === undefined) {
          return [];
        }

        return entities.study.annotationTypes.map(at => {
          const annotation = AnnotationFactory.annotationFromType(at);
          const participantAnnotation = entities.participant.annotations.find(
            a => a.annotationTypeId === annotation.annotationTypeId
          );
          if (participantAnnotation) {
            annotation.value = participantAnnotation.value;
          }
          return annotation;
        });
      }),
      tap(annotations => {
        this.menuItems = this.createMenuItems().concat(this.createMenuItemsForAnnotations(annotations));
      })
    );

    this.entities$
      .pipe(
        filter(() => this.notificationService.notificationPending()),
        takeUntil(this.unsubscribe$)
      )
      .subscribe(entities => {
        if (entities === undefined) {
          return;
        }

        this.notificationService.show();
        if (entities.participant.slug !== this.route.parent.snapshot.params.slug) {
          // uniqueId was changed and a new slug was assigned
          //
          // need to change state since slug is used in URL and by breadcrumbs
          this.router.navigate(['../..', entities.participant.slug, 'summary'], { relativeTo: this.route });
        }
      });

    this.store$
      .pipe(
        select(ParticipantStoreSelectors.selectParticipantError),
        filter(error => error !== null && this.notificationService.notificationPending()),
        takeUntil(this.unsubscribe$)
      )
      .subscribe(error => {
        let errMessage = error.error.error ? error.error.error.message : error.error.statusText;
        if (errMessage && errMessage.match(/participant with unique ID already exists/)) {
          errMessage = `A participant with the ID ${this.newUniqueId} already exits.`;
        }
        this.notificationService.showError(errMessage, 'Update Error');
      });
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  updateUniqueId() {
    const participant = this.entitiesSubject.value.participant;
    this.modalService
      .open(this.updateUniqueIdModal, { size: 'lg' })
      .result.then(value => {
        this.newUniqueId = value;
        this.store$.dispatch(
          ParticipantStoreActions.updateParticipantRequest({
            participant,
            attributeName: 'uniqueId',
            value
          })
        );
        this.notificationService.add('Unique ID was updated', 'Update Successfull');
      })
      .catch(() => undefined);
  }

  updateAnnotation(annotation: Annotation) {
    const participant = this.entitiesSubject.value.participant;
    this.annotationToEdit = annotation;

    this.modalService
      .open(this.updateAnnotationModal, { size: 'lg' })
      .result.then(value => {
        const updatedAnnotation = value;
        this.store$.dispatch(
          ParticipantStoreActions.updateParticipantRequest({
            participant,
            attributeName: 'addOrUpdateAnnotation',
            value: updatedAnnotation.serverAnnotation()
          })
        );
        this.notificationService.add(`${annotation.label} was updated`, 'Update Successfull');
      })
      .catch(() => {
        // don't care if user pressed the Cancel button
      });
  }

  private studyFromId(studyId: string, studies: Dictionary<Study>): Study {
    const study = studies[studyId];

    if (study) {
      return study instanceof Study ? study : new Study().deserialize(study);
    }
    return undefined;
  }

  private createMenuItems(): DropdownMenuItem[] {
    const items: DropdownMenuItem[] = [
      {
        kind: 'selectable',
        label: 'Update Unique ID',
        icon: 'edit',
        iconClass: 'success-icon',
        onSelected: () => {
          this.updateUniqueId();
        }
      }
    ];
    return items;
  }

  private createMenuItemsForAnnotations(annotations: Annotation[]): DropdownMenuItem[] {
    const items: DropdownMenuItem[] = annotations.map(annotation => ({
      kind: 'selectable',
      label: `Update ${annotation.label}`,
      icon: 'edit',
      iconClass: 'success-icon',
      onSelected: () => {
        this.updateAnnotation(annotation);
      }
    }));
    return items;
  }
}
