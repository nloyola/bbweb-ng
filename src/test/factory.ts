import { AnatomicalSource, ConcurrencySafeEntity, PagedReply, PreservationTemperature, PreservationType, SearchParams, SpecimenType } from '@app/domain';
import { MaxValueCount, ValueTypes } from '@app/domain/annotations';
import { CentreCounts, CentreState } from '@app/domain/centres';
import { StudyCounts, StudyState } from '@app/domain/studies';
import { UserState } from '@app/domain/users';
import * as _ from 'lodash';
import faker = require('faker');

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
  PERMISSION = 'permission',
}

/**
 * Generates plain objects for {@link domain|Domain Entities} simulating what is returned by the server.
 */
export class Factory {

  private defaultEntities = new Map();

  stringNext() {
    return this.domainEntityNameNext();
  }

  user(options: any = { membership: undefined }): any {
    const name = faker.name.findName();
    const defaults = {
      id: this.domainEntityIdNext(DomainEntities.USER),
      version: 0,
      name: name,
      slug: this.slugify(name),
      email: faker.internet.email(),
      state: UserState.Registered,
      roles: []
    };

    const membership = (options.membership) ? this.userMembership(options.membership) : {};

    const u = {
      ...defaults,
      ...this.commonFields(),
      ...options,
      ...{ membership }
    };
    this.defaultEntities.set(DomainEntities.USER, u);
    return u;
  }

  defaultUser(): any {
    const dflt = this.defaultEntities.get(DomainEntities.USER);
    return dflt ? dflt : this.user();
  }

  membershipBase(options?: any): any {
    const defaults = this.membershipBaseDefaults();
    const m = {
      ...defaults,
      ...this.commonFields(),
      ...options
    };
    this.defaultEntities.set(DomainEntities.MEMBERSHIP_BASE, m);
    return m;
  }

  defaultMembershipBase(): any {
    const dflt = this.defaultEntities.get(DomainEntities.MEMBERSHIP_BASE);
    return dflt ? dflt : this.membershipBase();
  }

  userMembership(options?: any): any {
    return this.membershipBase(options);
  }

  accessItem(options: any = {}): any {
    const defaults = this.accessItemDefaults();
    const item = {
      ...defaults,
      ...this.commonFields(),
      ...options
    };
    this.defaultEntities.set(DomainEntities.ACCESS_ITEM, item);
    return item;
  }

  role(options?: any): any {
    const role = {
      ...{ userData: [this.entityInfo()] },
      ...this.accessItem(options),
      ...options
    };
    this.defaultEntities.set(DomainEntities.ROLE, role);
    return role;
  }

  defaultRole(): any {
    const dflt = this.defaultEntities.get(DomainEntities.ROLE);
    return dflt ? dflt : this.role();
  }

  userRole(): any {
    const role = this.defaultRole(),
    userRole = _.omit(role, ['userData', 'parentData']);
    return userRole;
  }

  study(options?: any): any {
    const defaults = {
      ...{
        id:              this.domainEntityIdNext(DomainEntities.STUDY),
        version:         0,
        description:     faker.lorem.sentences(4),
        annotationTypes: [],
        state:           StudyState.Disabled
      },
      ...this.nameAndSlug()
    };

    const s = {
      ...defaults,
      ...options
    };
    this.defaultEntities.set(DomainEntities.STUDY, s);
    return s;
  }

  /**
   * Returns the last {@link domain.studies.Study Study} plain object created by this factory.
   */
  defaultStudy(): any {
    const dflt = this.defaultEntities.get(DomainEntities.STUDY);
    return dflt ? dflt : this.study();
  }

  collectionEventType(options: any = {}): any {
    const study = this.defaultStudy();
    const defaults = {
      ...{
        id:                  this.domainEntityIdNext(DomainEntities.COLLECTION_EVENT_TYPE),
        version:             0,
        studyId:             study.id,
        description:         faker.lorem.sentences(4),
        specimenDefinitions: [],
        annotationTypes:     [],
        recurring:           false
      },
      ...this.nameAndSlug()
    };

    const eventType = {
      ...defaults,
      ...options
    };
    this.defaultEntities.set(DomainEntities.COLLECTION_EVENT_TYPE, eventType);
    return eventType;
  }

  /**
   * Returns the last {@link domain.studies.CollectionEventType CollectionEventType} plain
   * object created by this factory.
   */
  defaultCollectionEventType(): any {
    const dflt = this.defaultEntities.get(DomainEntities.COLLECTION_EVENT_TYPE);
    return dflt ? dflt : this.collectionEventType();
  }

  processingType(options: any = {}): any {
    const study = this.defaultStudy();
    const defaults = {
      ...{
        id:                 this.domainEntityIdNext(DomainEntities.PROCESSING_TYPE),
        version:            0,
        studyId:            study.id,
        description:        faker.lorem.sentences(4),
        enabled:            false,
        input:              this.inputSpecimenProcessing(),
        output:             this.outputSpecimenProcessing(),
        annotationTypes:    []
      },
      ...this.nameAndSlug()
    };

    const processingType = {
      ...defaults,
      ...options
    };
    this.defaultEntities.set(DomainEntities.PROCESSING_TYPE, processingType);
    return processingType;
  }

  /**
   * Returns the last {@link domain.studies.ProcessingType ProcessingType} plain
   * object created by this factory.
   */
  defaultProcessingType(): any {
    const dflt = this.defaultEntities.get(DomainEntities.PROCESSING_TYPE);
    return dflt ? dflt : this.processingType();
  }

  entityInfo(): any {
    return {
      ...{ id: this.stringNext() },
      ...this.nameAndSlug()
    };
  }

  entitySet(): any {
    return { allEntities: false, entityData: [this.entityInfo()] };
  }

  /**
   * @param {ValueType} options.valueType the type of annotation Type to create. Valid types are: Text,
   * Number, DateTime and Select.
   *
   * @param {Int} options.maxValueCount when valueType is 'Select', use 1 for single selection or '2' for
   * multiple selection.
   */
  annotationType(options: any = {
    valueType: ValueTypes.Text,
    maxValueCount: MaxValueCount.None
  }): any {
    const defaults = {
      ...{
        id: this.domainEntityIdNext(DomainEntities.ANNOTATION_TYPE),
        description: null,
        valueType: ValueTypes.Text,
        options: [],
        maxValueCount: MaxValueCount.None,
        required: false
      },
      ...this.nameAndSlug()
    };

    if (!options.valueType) {
      options.valueType = ValueTypes.Text;
    }

    if (options.valueType === ValueTypes.Select) {
      if (!options.maxValueCount) {
        options.maxValueCount = MaxValueCount.SelectSingle;
      }

      if (!options.options) {
        options.options = [1, 2]
          .map(() => this.domainEntityNameNext(DomainEntities.ANNOTATION_TYPE));
      }
    }

    return {
      ...defaults,
      ...options
    };
  }

  processedSpecimenDefinition(options = {}) {
    const defaults = {
      ...{
        id:                      this.domainEntityIdNext(DomainEntities.PROCESSED_SPECIMEN_DEFINITION),
        description:             faker.lorem.sentences(4),
        units:                   'mL',
        anatomicalSourceType:    this.randomAnatomicalSourceType(),
        preservationType:        this.randomPreservationType(),
        preservationTemperature: this.randomPreservationTemperature(),
        specimenType:            this.randomSpecimenType()
      },
      ...this.nameAndSlug()
    };
    return {
      ...defaults,
      ...options
    };
  }

  inputSpecimenProcessing(options = {}) {
    const specimenDefinition =  this.processedSpecimenDefinition();
    const collectionEventType = this.collectionEventType({
      specimenDefinitions: [ specimenDefinition ]
    });
    const defaults = {
      expectedChange:       1.0,
      count:                1,
      containerTypeId:      null,
      definitionType:       'collected',
      entityId:             collectionEventType.id,
      specimenDefinitionId: specimenDefinition.id
    };
    return {
      ...defaults,
      ...options
    };
  }

  outputSpecimenProcessing(options = {}) {
    const defaults = {
      expectedChange:     1.0,
      count:              1,
      containerTypeId:    null,
      specimenDefinition: this.processedSpecimenDefinition()
    };
    return {
      ...defaults,
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

  collectedSpecimenDefinition(options: any = {}): any {
    const defaults = {
      ...{
        id:                      this.domainEntityIdNext(DomainEntities.COLLECTED_SPECIMEN_DEFINITION),
        description:             faker.lorem.sentences(4),
        units:                   'mL',
        anatomicalSourceType:    this.randomAnatomicalSourceType(),
        preservationType:        this.randomPreservationType(),
        preservationTemperature: this.randomPreservationTemperature(),
        specimenType:            this.randomSpecimenType(),
        maxCount:                1,
        amount:                  0.5
      },
      ...this.nameAndSlug()
    };

    return {
      ...defaults,
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

  centre(options?: any): any {
    const s = {
      ...{
        id:              this.domainEntityIdNext(DomainEntities.CENTRE),
        version:         0,
        description:     faker.lorem.sentences(4),
        studyNames:      [],
        locations:       [],
        state:           CentreState.Disabled
      },
      ...options,
      ...this.nameAndSlug()
    };
    this.defaultEntities.set(DomainEntities.CENTRE, s);
    return s;
  }

  /**
   * Returns the last {@link domain.centres.Centre Centre} plain object created by this factory.
   */
  defaultCentre(): any {
    const dflt = this.defaultEntities.get(DomainEntities.CENTRE);
    return dflt ? dflt : this.centre();
  }

  pagedReply<T extends ConcurrencySafeEntity>(entities: T[]): PagedReply<T> {
    const searchParams = new SearchParams();
    return {
      searchParams,
      entities,
      offset: 0,
      total: entities.length,
      maxPages: 1
    };
  }

  nameAndSlug(): any {
    const name = this.stringNext();
    return {
      slug: this.slugify(name),
      name: name
    };
  }

  entityNameDto(entity: any, options: any = {}): any {
    const combined = { ...entity, ...options };
    return {
      id: combined.id,
      slug: combined.slug,
      name: combined.name
    };
  }

  entityNameAndStateDto(entity: any, options: any = {}): any {
    const combined = { ...entity, ...options };
    return {
      ...this.entityNameDto(entity, options),
      state: combined.state
    };
  }

  location(options: any = {}) {
    const location = {
      ...{
        id: this.domainEntityIdNext(DomainEntities.LOCATION),
        street:         faker.address.streetAddress(),
        city:           faker.address.city(),
        province:       faker.address.state(),
        postalCode:     faker.address.zipCode(),
        poBoxNumber:    faker.address.zipCode(),
        countryIsoCode: faker.address.country()
      },
      ...options,
      ...this.nameAndSlug()
    };
    return location;
  }

  domainEntityName(entity: any): any {
    return {
      id: entity.id,
      slug: entity.slug,
      name: entity.name
    };
  }

  specimenDefinitionNames(eventTypes: any[]): any {
    return eventTypes.map(et => ({
      ...this.domainEntityName(et),
      specimenDefinitionNames: et.specimenDefinitions.map(sd => this.domainEntityName(sd))
    }));
  }

  private domainEntityNameNext(domainEntityType?: string) {
    const id = domainEntityType ? domainEntityType : 'string';
    return _.uniqueId(id + '_');
  }

  private domainEntityIdNext(domainEntityType?: string) {
    return this.domainEntityNameNext(domainEntityType);
  }

  private commonFields(): any {
    return {
      version: 0,
      timeAdded: faker.date.recent(10),
      timeModified: faker.date.recent(5)
    };
  }

  // this function taken from here:
  // https://gist.github.com/mathewbyrne/1280286
  private slugify(text: string): string {
    return text.toString().toLowerCase().trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '_')
      .replace(/^-+|-+$/g, '');
  }

  private membershipBaseDefaults() {
    const name = this.domainEntityNameNext(DomainEntities.MEMBERSHIP_BASE);
    return {
      id: this.domainEntityIdNext(DomainEntities.MEMBERSHIP_BASE),
      name: name,
      slug: this.slugify(name),
      description: faker.lorem.sentences(4),
      studyData: this.entitySet(),
      centreData: this.entitySet()
    };
  }

  private accessItemDefaults() {
    const name = this.domainEntityNameNext(DomainEntities.ACCESS_ITEM);
    return {
      id: this.domainEntityIdNext(DomainEntities.ACCESS_ITEM),
      name: name,
      slug: this.slugify(name),
      description: faker.lorem.sentences(4),
      parentData: [this.entityInfo()],
      childData: [this.entityInfo()]
    };
  }

}
