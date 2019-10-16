import {
  AnatomicalSource,
  ConcurrencySafeEntity,
  HasName,
  HasSlug,
  IConcurrencySafeEntity,
  IDomainEntity,
  IEntityInfo,
  IEntityInfoAndState,
  IEntityInfoSet,
  PagedReply,
  PreservationTemperature,
  PreservationType,
  SearchParams,
  slugify,
  SpecimenType,
  ILocation
} from '@app/domain';
import {
  IAccessItem,
  IMembership,
  IMembershipBase,
  IRole,
  IUserMembership,
  IUserRole
} from '@app/domain/access';
import { IAnnotation, IAnnotationType, MaxValueCount, ValueTypes } from '@app/domain/annotations';
import { CentreCounts, CentreState, ICentre, ICentreLocationInfo } from '@app/domain/centres';
import { ICollectionEvent, IParticipant, ISpecimen, SpecimenState } from '@app/domain/participants';
import { IShipment, IShipmentSpecimen, ShipmentItemState, ShipmentState } from '@app/domain/shipments';
import {
  ICollectedSpecimenDefinition,
  ICollectedSpecimenDefinitionName,
  ICollectionEventType,
  IInputSpecimenProcessing,
  IOutputSpecimenProcessing,
  IProcessedSpecimenDefinition,
  IProcessedSpecimenDefinitionName,
  IProcessingType,
  IStudy,
  StudyCounts,
  StudyState
} from '@app/domain/studies';
import { IUser, UserCounts, UserState } from '@app/domain/users';
import * as _ from 'lodash';
import * as faker from 'faker';

enum DomainEntities {
  STUDY = 'study',
  COLLECTION_EVENT_TYPE = 'collectionEventType',
  COLLECTION_SPECIMEN_DEFINITION = 'collectionSpecimenDefinition',
  ANNOTATION_TYPE = 'annotationType',
  PROCESSING_TYPE = 'processingType',
  PROCESSED_SPECIMEN_DEFINITION = 'processedSpecimenDefinition',
  PARTICIPANT = 'participant',
  COLLECTION_EVENT = 'collectionEvent',
  COLLECTED_SPECIMEN_DEFINITION = 'collectedSpecimenDefinition',
  SPECIMEN = 'specimen',
  CENTRE = 'centre',
  LOCATION = 'location',
  SHIPMENT = 'shipment',
  SHIPMENT_SPECIMEN = 'shipmentSpecimen',
  USER = 'user',
  MEMBERSHIP_BASE = 'membershipBase',
  MEMBERSHIP = 'membership',
  ACCESS_ITEM = 'accessItem',
  ROLE = 'role',
  PERMISSION = 'permission'
}

interface INameAndSlug extends HasName, HasSlug {}

/**
 * Generates plain objects for {@link domain|Domain Entities} simulating what is returned by the server.
 */
export class Factory {
  private defaultEntities = new Map();

  stringNext() {
    return this.domainEntityNameNext();
  }

  user(options: any = { membership: undefined }): IUser {
    const name = faker.name.findName();
    const membership = options.membership ? this.userMembership(options.membership) : {};

    const u = {
      ...this.commonFields(),
      id: this.domainEntityIdNext(DomainEntities.USER),
      version: 0,
      name: name,
      slug: slugify(name),
      email: faker.internet.email(),
      state: UserState.Registered,
      roles: [],
      ...options,
      membership: membership
    };
    this.defaultEntities.set(DomainEntities.USER, u);
    return u;
  }

  defaultUser(): IUser {
    const dflt = this.defaultEntities.get(DomainEntities.USER);
    return dflt ? dflt : this.user();
  }

  membershipBase(options: any = {}): IMembershipBase {
    const m = {
      ...this.commonFields(),
      ...this.membershipBaseDefaults(),
      ...options
    };
    this.defaultEntities.set(DomainEntities.MEMBERSHIP_BASE, m);
    return m;
  }

  defaultMembershipBase(): IMembershipBase {
    const dflt = this.defaultEntities.get(DomainEntities.MEMBERSHIP_BASE);
    return dflt ? dflt : this.membershipBase();
  }

  userMembership(options: any = {}): IUserMembership {
    return this.membershipBase(options);
  }

  membership(options: any = {}): IMembership {
    return {
      ...this.membershipBase(options),
      userData: []
    };
  }

  defaultMembership(): IMembership {
    const dflt = this.defaultEntities.get(DomainEntities.MEMBERSHIP);
    return dflt ? dflt : this.membership();
  }

  accessItem(options: any = {}): IAccessItem {
    const item = {
      ...this.commonFields(),
      ...this.accessItemDefaults(),
      ...options
    };
    this.defaultEntities.set(DomainEntities.ACCESS_ITEM, item);
    return item;
  }

  role(options: any = {}): IRole {
    const role = {
      ...this.accessItem(options),
      userData: [this.entityInfo()],
      ...options
    };
    this.defaultEntities.set(DomainEntities.ROLE, role);
    return role;
  }

  defaultRole(): IRole {
    const dflt = this.defaultEntities.get(DomainEntities.ROLE);
    return dflt ? dflt : this.role();
  }

  userRole(): IUserRole {
    const { userData, parentData, ...userRole } = this.defaultRole();
    return {
      ...userRole,
      parentData: []
    };
  }

  study(options: any = {}): IStudy {
    const s = {
      ...this.commonFields(),
      id: this.domainEntityIdNext(DomainEntities.STUDY),
      version: 0,
      description: faker.lorem.sentences(4),
      annotationTypes: [],
      state: StudyState.Disabled,
      ...this.nameAndSlug(),
      ...options
    };
    this.defaultEntities.set(DomainEntities.STUDY, s);
    return s;
  }

  /**
   * Returns the last {@link domain.studies.Study Study} plain object created by this factory.
   */
  defaultStudy(): IStudy {
    const dflt = this.defaultEntities.get(DomainEntities.STUDY);
    return dflt ? dflt : this.study();
  }

  collectionEventType(options: any = {}): ICollectionEventType {
    const study = this.defaultStudy();
    const eventType = {
      ...this.commonFields(),
      id: this.domainEntityIdNext(DomainEntities.COLLECTION_EVENT_TYPE),
      version: 0,
      studyId: study.id,
      description: faker.lorem.sentences(4),
      specimenDefinitions: [],
      annotationTypes: [],
      recurring: false,
      ...this.nameAndSlug(),
      ...options
    };
    this.defaultEntities.set(DomainEntities.COLLECTION_EVENT_TYPE, eventType);
    return eventType;
  }

  /**
   * Returns the last {@link domain.studies.CollectionEventType CollectionEventType} plain
   * object created by this factory.
   */
  defaultCollectionEventType(): ICollectionEventType {
    const dflt = this.defaultEntities.get(DomainEntities.COLLECTION_EVENT_TYPE);
    return dflt ? dflt : this.collectionEventType();
  }

  processingType(options: any = {}): IProcessingType {
    const study = this.defaultStudy();
    const processingType = {
      ...this.commonFields(),
      id: this.domainEntityIdNext(DomainEntities.PROCESSING_TYPE),
      version: 0,
      studyId: study.id,
      description: faker.lorem.sentences(4),
      enabled: false,
      annotationTypes: [],
      input: this.inputSpecimenProcessing(options.input),
      output: this.outputSpecimenProcessing(options.output),
      ...this.nameAndSlug(),
      ...options
    };
    this.defaultEntities.set(DomainEntities.PROCESSING_TYPE, processingType);
    return processingType;
  }

  /**
   * Returns the last {@link domain.studies.ProcessingType ProcessingType} plain
   * object created by this factory.
   */
  defaultProcessingType(): IProcessingType {
    const dflt = this.defaultEntities.get(DomainEntities.PROCESSING_TYPE);
    return dflt ? dflt : this.processingType();
  }

  entityInfo<T extends IDomainEntity & HasSlug & HasName>(): IEntityInfo<T> {
    return {
      id: this.stringNext(),
      ...this.nameAndSlug()
    };
  }

  entityToInfo<T extends IDomainEntity & HasSlug & HasName>(entity: any): IEntityInfo<T> {
    return {
      id: entity.id,
      name: entity.name,
      slug: entity.slug
    };
  }

  entitySet<T extends IDomainEntity & HasSlug & HasName>(): IEntityInfoSet<T> {
    return { allEntities: false, entityData: [this.entityInfo()] };
  }

  /**
   * @param {ValueType} options.valueType the type of annotation Type to create. Valid types are: Text,
   * Number, DateTime and Select.
   *
   * @param {Int} options.maxValueCount when valueType is 'Select', use 1 for single selection or '2' for
   * multiple selection.
   */
  annotationType(
    options: any = {
      valueType: ValueTypes.Text,
      maxValueCount: MaxValueCount.None
    }
  ): IAnnotationType {
    const defaults = {
      id: this.domainEntityIdNext(DomainEntities.ANNOTATION_TYPE),
      description: null,
      valueType: ValueTypes.Text,
      options: [],
      maxValueCount: MaxValueCount.None,
      required: false
    };

    if (!options.valueType) {
      options.valueType = ValueTypes.Text;
    }

    if (options.valueType === ValueTypes.Select) {
      if (!options.maxValueCount) {
        options.maxValueCount = MaxValueCount.SelectSingle;
      }

      if (!options.options) {
        options.options = [1, 2].map(() => this.domainEntityNameNext(DomainEntities.ANNOTATION_TYPE));
      }
    }

    return {
      ...defaults,
      ...this.nameAndSlug(),
      ...options
    };
  }

  singleSelectAnnotationType(options: any = {}): IAnnotationType {
    const annotationOptions = options.options ? options.options : ['opt1', 'opt2', 'opt3'];
    return this.annotationType({
      valueType: ValueTypes.Select,
      maxValueCount: 1,
      options: annotationOptions
    });
  }

  multipleSelectAnnotationType(options: any = {}): IAnnotationType {
    const annotationType = this.singleSelectAnnotationType(options);
    annotationType.maxValueCount = 2;
    return annotationType;
  }

  processedSpecimenDefinition(options = {}): IProcessedSpecimenDefinition {
    return {
      id: this.domainEntityIdNext(DomainEntities.PROCESSED_SPECIMEN_DEFINITION),
      description: faker.lorem.sentences(4),
      units: 'mL',
      anatomicalSourceType: this.randomAnatomicalSourceType(),
      preservationType: this.randomPreservationType(),
      preservationTemperature: this.randomPreservationTemperature(),
      specimenType: this.randomSpecimenType(),
      ...this.nameAndSlug(),
      ...options
    };
  }

  inputSpecimenProcessing(options = {}): IInputSpecimenProcessing {
    const specimenDefinition = this.processedSpecimenDefinition();
    const collectionEventType = this.collectionEventType({
      specimenDefinitions: [specimenDefinition]
    });
    return {
      definitionType: 'collected',
      entityId: collectionEventType.id,
      specimenDefinitionId: specimenDefinition.id,
      expectedChange: 1.0,
      count: 1,
      containerTypeId: null,
      ...options
    };
  }

  outputSpecimenProcessing(options = {}): IOutputSpecimenProcessing {
    return {
      specimenDefinition: this.processedSpecimenDefinition(),
      expectedChange: 1.0,
      count: 1,
      containerTypeId: null,
      ...options
    };
  }

  randomAnatomicalSourceType(): AnatomicalSource {
    return faker.random.arrayElement(Object.values(AnatomicalSource));
  }

  randomPreservationType(): PreservationType {
    return faker.random.arrayElement(Object.values(PreservationType));
  }

  randomPreservationTemperature(): PreservationTemperature {
    return faker.random.arrayElement(Object.values(PreservationTemperature));
  }

  randomSpecimenType(): SpecimenType {
    return faker.random.arrayElement(Object.values(SpecimenType));
  }

  collectedSpecimenDefinition(options: any = {}): ICollectedSpecimenDefinition {
    const defaults = {
      id: this.domainEntityIdNext(DomainEntities.COLLECTED_SPECIMEN_DEFINITION),
      description: faker.lorem.sentences(4),
      units: 'mL',
      anatomicalSourceType: this.randomAnatomicalSourceType(),
      preservationType: this.randomPreservationType(),
      preservationTemperature: this.randomPreservationTemperature(),
      specimenType: this.randomSpecimenType(),
      maxCount: 1,
      amount: 0.5
    };

    return {
      ...defaults,
      ...this.nameAndSlug(),
      ...options
    };
  }

  studyCounts(): StudyCounts {
    return {
      total: 3,
      disabledCount: 1,
      enabledCount: 1,
      retiredCount: 1
    };
  }

  centreCounts(): CentreCounts {
    return {
      total: 2,
      disabledCount: 1,
      enabledCount: 1
    };
  }

  userCounts(): UserCounts {
    return {
      total: 3,
      registeredCount: 1,
      activeCount: 1,
      lockedCount: 1
    };
  }

  centre(options: any = {}): ICentre {
    const s = {
      id: this.domainEntityIdNext(DomainEntities.CENTRE),
      version: 0,
      description: faker.lorem.sentences(4),
      studyNames: [],
      locations: [],
      state: CentreState.Disabled,
      ...options,
      ...this.nameAndSlug()
    };
    this.defaultEntities.set(DomainEntities.CENTRE, s);
    return s;
  }

  /**
   * Returns the last {@link domain.centres.Centre Centre} plain object created by this factory.
   */
  defaultCentre(): ICentre {
    const dflt = this.defaultEntities.get(DomainEntities.CENTRE);
    return dflt ? dflt : this.centre();
  }

  pagedReply<T extends ConcurrencySafeEntity>(entities: T[]): PagedReply<T> {
    return {
      searchParams: {},
      entities,
      offset: 0,
      total: entities.length,
      maxPages: 1
    };
  }

  nameAndSlug(): INameAndSlug {
    const name = this.stringNext();
    return {
      slug: slugify(name),
      name: name
    };
  }

  entityNameDto<T extends IDomainEntity & HasSlug & HasName>(entity: any, options: any = {}): IEntityInfo<T> {
    const combined = { ...entity, ...options };
    return {
      id: combined.id,
      slug: combined.slug,
      name: combined.name
    };
  }

  entityNameAndStateDto<T extends IDomainEntity & HasSlug & HasName, S>(
    entity: T,
    options: any = {}
  ): IEntityInfoAndState<T, S> {
    const combined = { ...entity, ...options };
    return {
      ...this.entityNameDto(entity, options),
      state: combined.state
    };
  }

  location(options: any = {}): ILocation {
    const location = {
      id: this.domainEntityIdNext(DomainEntities.LOCATION),
      street: faker.address.streetAddress(),
      city: faker.address.city(),
      province: faker.address.state(),
      postalCode: faker.address.zipCode(),
      poBoxNumber: faker.address.zipCode(),
      countryIsoCode: faker.address.country(),
      ...options,
      ...this.nameAndSlug()
    };
    return location;
  }

  collectedSpecimenDefinitionNames(eventTypes: any[]): ICollectedSpecimenDefinitionName[] {
    return eventTypes.map(et => ({
      ...this.entityToInfo(et),
      specimenDefinitionNames: et.specimenDefinitions.map(sd => this.entityToInfo(sd))
    }));
  }

  processedSpecimenDefinitionNames(processingTypes: any[]): IProcessedSpecimenDefinitionName[] {
    return processingTypes.map(pt => ({
      ...this.entityToInfo(pt),
      specimenDefinitionName: this.entityToInfo(pt.output.specimenDefinition)
    }));
  }

  shipment(options: any = {}): IShipment {
    const loc = this.location();
    const ctr = this.centre({ locations: [loc] });
    const locationInfo = this.centreLocationInfo(ctr, loc);
    const s = {
      ...this.commonFields(),
      id: this.domainEntityIdNext(DomainEntities.SHIPMENT),
      state: ShipmentState.Created,
      courierName: this.stringNext(),
      trackingNumber: this.stringNext(),
      origin: locationInfo,
      destination: locationInfo,
      specimenCount: 0,
      ...options
    };
    this.defaultEntities.set(DomainEntities.SHIPMENT, s);
    return s;
  }

  defaultShipment(): IShipment {
    const dflt = this.defaultEntities.get(DomainEntities.SHIPMENT);
    return dflt ? dflt : this.shipment();
  }

  shipmentSpecimen(options: any = {}): IShipmentSpecimen {
    const ss = {
      ...this.commonFields(),
      id: this.domainEntityIdNext(DomainEntities.SHIPMENT_SPECIMEN),
      state: ShipmentItemState.Present,
      shipmentId: this.defaultShipment().id,
      specimenId: this.defaultSpecimen().id,
      ...options
    };
    this.defaultEntities.set(DomainEntities.SHIPMENT_SPECIMEN, ss);
    return ss;
  }

  defaultShipmentSpecimen(): IShipmentSpecimen {
    const dflt = this.defaultEntities.get(DomainEntities.SHIPMENT_SPECIMEN);
    return dflt ? dflt : this.shipment();
  }

  /**
   * If {@link test.services.Factory#defaultStudy defaultStudy} has annotation types, then participant will
   * have annotations based on the study's, unless options.annotationTypes is defined.
   */
  participant(options: any = {}): IParticipant {
    const study = this.defaultStudy();
    const uniqueId = this.domainEntityIdNext(DomainEntities.PARTICIPANT);
    const p = {
      ...this.commonFields(),
      id: this.domainEntityIdNext(DomainEntities.PARTICIPANT),
      version: 0,
      study: this.entityToInfo(study),
      uniqueId,
      annotations: [],
      slug: slugify(uniqueId),
      ...options
    };
    this.defaultEntities.set(DomainEntities.PARTICIPANT, p);
    return p;
  }

  defaultParticipant(): IParticipant {
    const dflt = this.defaultEntities.get(DomainEntities.PARTICIPANT);
    return dflt ? dflt : this.participant();
  }

  /**
   * @param options.value The value for the annotation.
   */
  annotation(options: any = {}, annotationType?: any): IAnnotation {
    const annotationTypeId = annotationType ? annotationType.id : undefined;
    const valueType = annotationType ? annotationType.valueType : undefined;
    const annotation = {
      annotationTypeId: null,
      stringValue: null,
      numberValue: null,
      selectedValues: [],
      valueType,
      ...options
    };

    const value = options ? options.value : undefined;
    if (value !== undefined && valueType !== undefined) {
      switch (valueType) {
        case ValueTypes.Text:
        case ValueTypes.DateTime:
          annotation.stringValue = options.value;
          break;

        case ValueTypes.Number:
          annotation.numberValue = options.value;
          break;

        case ValueTypes.Select:
          if (value !== undefined && value !== '') {
            const maxValueCount = annotationType ? annotationType.maxValueCount : undefined;
            if (maxValueCount === 1) {
              annotation.selectedValues = [options.value];
            } else if (maxValueCount === 2) {
              annotation.selectedValues = options.value;
            } else {
              throw new Error('invalid max value count for annotation: ' + annotationType.maxValueCount);
            }
          }
          break;

        default:
          throw new Error('invalid annotation value type: ' + annotationType.valueType);
      }
    }

    return annotation;
  }

  centreLocationInfo(centre: ICentre, location?: ILocation): ICentreLocationInfo {
    if (location === undefined && (!centre.locations || centre.locations.length < 1)) {
      throw new Error('centre does not have any locations');
    }
    location = centre.locations[0];
    return {
      id: centre.id,
      slug: centre.slug,
      name: centre.name,
      location: {
        id: location.id,
        slug: location.slug,
        name: location.name
      },
      combinedName: centre.name + ': ' + location.name
    };
  }

  specimen(options: any = {}): ISpecimen {
    const eventType = this.collectionEventType({
      specimenDefinitions: [this.collectedSpecimenDefinition()]
    });
    const event = this.defaultCollectionEvent();
    const ctr = this.centre({ locations: [this.location()] });
    const inventoryId = this.domainEntityNameNext(DomainEntities.SPECIMEN);
    const specimen = {
      ...this.commonFields(),
      id: this.domainEntityIdNext(DomainEntities.SPECIMEN),
      version: 0,
      slug: slugify(inventoryId),
      inventoryId: inventoryId,
      eventId: event.id,
      specimenDefinitionId: null,
      originLocationInfo: null,
      locationInfo: null,
      timeCreated: faker.date.recent(10),
      amount: 1,
      state: SpecimenState.USABLE,
      eventTypeName: eventType.name,
      ...options
    };

    if (eventType.specimenDefinitions && eventType.specimenDefinitions.length > 0) {
      specimen.specimenDefinitionId = eventType.specimenDefinitions[0].id;
    }

    if (ctr.locations && ctr.locations.length > 0) {
      specimen.originLocationInfo = this.centreLocationInfo(ctr);
      specimen.locationInfo = specimen.originLocationInfo;
    }

    this.defaultEntities.set(DomainEntities.SPECIMEN, specimen);
    return specimen;
  }

  defaultSpecimen(): ISpecimen {
    const dflt = this.defaultEntities.get(DomainEntities.SPECIMEN);
    return dflt ? dflt : this.specimen();
  }

  collectionEvent(options: any = {}): ICollectionEvent {
    const participant = this.defaultParticipant();
    const collectionEventType = this.defaultCollectionEventType();
    const visitNumber = 1;
    const ce = {
      id: this.domainEntityIdNext(DomainEntities.COLLECTION_EVENT),
      version: 0,
      participantId: participant.id,
      participantSlug: participant.slug,
      eventTypeId: collectionEventType.id,
      eventTypeSlug: collectionEventType.slug,
      timeCompleted: faker.date.recent(10),
      slug: slugify('visit-number-' + visitNumber),
      visitNumber: visitNumber,
      annotations: [],
      ...options
    };

    if (!options.annotations) {
      // assign annotation types
      if (options.annotationTypes) {
        ce.annotations = this.annotations(options.annotationTypes);
      } else if (collectionEventType.annotationTypes) {
        ce.annotations = this.annotations(collectionEventType.annotationTypes);
      }
    }

    this.defaultEntities.set(DomainEntities.COLLECTION_EVENT, ce);
    return ce;
  }

  defaultCollectionEvent(): ICollectionEvent {
    const dflt = this.defaultEntities.get(DomainEntities.COLLECTION_EVENT);
    return dflt ? dflt : this.collectionEvent();
  }

  annotations(annotationTypes: any[]): IAnnotation[] {
    return annotationTypes.map(annotationType => {
      const value = this.valueForAnnotation(annotationType);
      return this.annotation({ value: value }, annotationType);
    });
  }

  valueForAnnotation(annotationType: any): string | number | Date | string[] {
    switch (annotationType.valueType) {
      case ValueTypes.Text:
        return this.stringNext();

      case ValueTypes.Number:
        return faker.random.number({ precision: 0.05 }).toString();

      case ValueTypes.DateTime:
        // has to be in UTC format, with no seconds or milliseconds
        return faker.date.past(1);

      case ValueTypes.Select:
        if (annotationType.maxValueCount === 1) {
          return annotationType.options[0];
        } else if (annotationType.maxValueCount > 1) {
          return annotationType.options;
        } else {
          throw new Error('invalid max value count: ' + annotationType.maxValueCount);
        }
    }

    throw new Error('invalid value type: ' + annotationType.valueType);
  }

  // this function taken from here:
  // https://gist.github.com/mathewbyrne/1280286
  slugify(text: string): string {
    return text
      .toString()
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '_')
      .replace(/^-+|-+$/g, '');
  }

  private domainEntityNameNext(domainEntityType?: string): string {
    const id = domainEntityType ? domainEntityType : 'string';
    return _.uniqueId(id + '_');
  }

  private domainEntityIdNext(domainEntityType?: string): string {
    return this.domainEntityNameNext(domainEntityType);
  }

  private commonFields(): IConcurrencySafeEntity {
    return {
      id: undefined,
      version: 0,
      timeAdded: faker.date.recent(10),
      timeModified: faker.date.recent(5)
    };
  }

  private membershipBaseDefaults(): Pick<
    IMembershipBase,
    'id' | 'name' | 'slug' | 'description' | 'studyData' | 'centreData'
  > {
    const name = this.domainEntityNameNext(DomainEntities.MEMBERSHIP_BASE);
    return {
      id: this.domainEntityIdNext(DomainEntities.MEMBERSHIP_BASE),
      name: name,
      slug: slugify(name),
      description: faker.lorem.sentences(4),
      studyData: this.entitySet(),
      centreData: this.entitySet()
    };
  }

  private accessItemDefaults(): Pick<
    IAccessItem,
    'id' | 'name' | 'slug' | 'description' | 'parentData' | 'childData'
  > {
    const name = this.domainEntityNameNext(DomainEntities.ACCESS_ITEM);
    return {
      id: this.domainEntityIdNext(DomainEntities.ACCESS_ITEM),
      name: name,
      slug: slugify(name),
      description: faker.lorem.sentences(4),
      parentData: [this.entityInfo()],
      childData: [this.entityInfo()]
    };
  }
}
