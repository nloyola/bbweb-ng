import { Component, OnInit, ViewChild, TemplateRef, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Participant } from '@app/domain/participants';
import { ParticipantStoreSelectors, RootStoreState, StudyStoreActions, StudyStoreSelectors, ParticipantStoreActions } from '@app/root-store';
import { select, Store, createSelector } from '@ngrx/store';
import { Observable, Subject } from 'rxjs';
import { map, shareReplay, takeUntil, tap, withLatestFrom } from 'rxjs/operators';
import { Dictionary } from '@ngrx/entity';
import { Study } from '@app/domain/studies';
import { annotationFromType, Annotation } from '@app/domain/annotations';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { ModalInputTextOptions } from '@app/modules/modals/models';

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

  @ViewChild('updateUniqueIdModal') updateUniqueIdModal: TemplateRef<any>;
  @ViewChild('updateAnnotationModal') updateAnnotationModal: TemplateRef<any>;

  entities$: Observable<EntityData>;
  participant$: Observable<Participant>;
  annotations$: Observable<Annotation[]>;
  annotationToEdit: Annotation;

  uniqueIdModalOptions: ModalInputTextOptions = {
    required: true,
    minLength: 2
  };

  annotationModalOptions: ModalInputTextOptions = {};

  private participantId: string;
  private participantSlug: string;
  private entities: EntityData;
  private updatedMessage$ = new Subject<string>();
  private unsubscribe$ = new Subject<void>();

  constructor(private store$: Store<RootStoreState.State>,
              private router: Router,
              private route: ActivatedRoute,
              private modalService: NgbModal,
              private toastr: ToastrService) { }

  ngOnInit() {
    this.participantSlug = this.route.parent.snapshot.params.slug;

    const entitiesSelector = createSelector(
      ParticipantStoreSelectors.selectAllParticipants,
      StudyStoreSelectors.selectAllStudyEntities,
      (participants: Participant[], studies: Dictionary<Study>): EntityData => {
        const participant = participants.find(p => p.slug === this.participantSlug);
        if (participant) {
          this.participantId = participant.id;
          const participantEntity = (participant instanceof Participant)
            ? participant : new Participant().deserialize(participant);

          return {
            participant: participantEntity,
            study: this.studyFromId(participant.study.id, studies)
          };
        }

        if (this.participantId) {
          const participantById = participants.find(p => p.id === this.participantId);
          if (!participantById) {
            throw new Error('could not find participant by ID');
          }

          const participantEntity = (participantById instanceof Participant)
            ? participant : new Participant().deserialize(participantById);

          return {
            participant: participantEntity,
            study: this.studyFromId(participantById.study.id, studies)
          };
        }

        return undefined;
      });

    this.entities$ = this.store$.pipe(
      select(entitiesSelector),
      tap(entities => {
        this.entities = entities;
        if ((entities.study === undefined) || (entities.study.timeAdded === undefined)) {
          this.store$.dispatch(StudyStoreActions.getStudyRequest({ slug: entities.participant.study.slug }));
        }
      }),
      takeUntil(this.unsubscribe$),
      shareReplay());

    this.participant$ = this.entities$.pipe(map(entities => entities.participant));

    this.entities$.pipe(
      withLatestFrom(this.updatedMessage$),
      takeUntil(this.unsubscribe$)
    ).subscribe(([ entities, message ]) => {
      if (entities === undefined) { return; }

      if (entities.participant.slug === this.participantSlug) {
        this.toastr.success(message, 'Update Successfull');
      } else {
        // uniqueId was changed and a new slug was assigned
        //
        // need to change state since slug is used in URL and by breadcrumbs
        this.router.navigate([ '../..', entities.participant.slug, 'summary' ], { relativeTo: this.route });
        this.participantSlug = entities.participant.slug;
      }
    });

    this.annotations$ = this.entities$.pipe(map(entities => {
      if (entities.study === undefined) { return []; }

      return entities.study.annotationTypes.map(at => {
        const annotation = annotationFromType(at);
        const participantAnnotation =
          entities.participant.annotations.find(a => a.annotationTypeId === annotation.annotationTypeId);
        if (participantAnnotation) {
          annotation.value = participantAnnotation.value;
        }
        return annotation;
      });
    }));
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  updateUniqueId() {
    this.modalService.open(this.updateUniqueIdModal, { size: 'lg' }).result
      .then(value => {
        this.store$.dispatch(ParticipantStoreActions.updateParticipantRequest({
          participant: this.entities.participant,
          attributeName: 'uniqueId',
          value
        }));
        this.updatedMessage$.next('Unique ID was updated');
      })
      .catch(() => {
        // don't care if user pressed the Cancel button
      });
  }

  updateAnnotation(annotation: Annotation) {
    console.log(annotation);
    this.annotationToEdit = annotation;

    this.modalService.open(this.updateAnnotationModal, { size: 'lg' }).result
      .then(value => {
        const updatedAnnotation = value;
        this.store$.dispatch(ParticipantStoreActions.updateParticipantRequest({
          participant: this.entities.participant,
          attributeName: 'addAnnotation',
          value: updatedAnnotation.serverAnnotation()
        }));
        this.updatedMessage$.next(`${annotation.label} was updated`);
      })
      .catch(() => {
        // don't care if user pressed the Cancel button
      });
  }

  private studyFromId(studyId: string, studies: Dictionary<Study>): Study {
    const study = studies[studyId];

    if (study) {
      return (study instanceof Study) ? study : new Study().deserialize(study);
    }
    return undefined;
  }

}
