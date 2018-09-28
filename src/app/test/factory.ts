import { UserState } from '@app/domain/users';
import { StudyState, StudyCounts } from '@app/domain/studies';
import { ValueTypes, MaxValueCount } from '@app/domain/annotations';

import * as faker from 'faker';
import * as _ from 'lodash';
import { ConcurrencySafeEntity, PagedReply, SearchParams } from '@app/domain';

enum DomainEntities {

  STUDY = 'study',
  COLLECTION_EVENT_TYPE = 'collectionEventType',
  COLLECTION_SPECIMEN_DEFINITION = 'collectionSpecimenDefinition',
  ANNOTATION_TYPE = 'annotationType',
  PROCESSING_TYPE = 'processingType',
  PROCESSED_SPECIMEN_DEFINITION = 'processedSpecimenDefinition',
  PARTICIPANT = 'participant',
  COLLECTION_EVENT = 'collectionEvent',
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
        id: this.domainEntityIdNext(DomainEntities.STUDY),
        description: faker.lorem.sentences(4),
        annotationTypes: [],
        state: StudyState.Disabled
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
  })
  : any {
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

  studyCounts(): StudyCounts {
    return {
      total: 3,
      disabledCount: 1,
      enabledCount: 1,
      retiredCount: 1
    };
  }

  pagedReply<T extends ConcurrencySafeEntity>(entities: T[]): PagedReply<T> {
    const searchParams = new SearchParams();
    return new PagedReply<T>(searchParams, entities, 0, entities.length);
  }

  private domainEntityNameNext(domainEntityType?: string) {
    const id = domainEntityType ? domainEntityType : 'string';
    return _.uniqueId(id + '_');
  }

  private domainEntityIdNext(domainEntityType?: string) {
    return this.domainEntityNameNext(domainEntityType);
  }

  private commonFields() {
    return {
      version: 0,
      timeAdded: faker.date.recent(10),
      timeModified: faker.date.recent(5)
    };
  }

  private nameAndSlug() {
    const name = this.stringNext();
    return {
      slug: this.slugify(name),
      name: name
    };
  }

  // this function taken from here:
  // https://gist.github.com/mathewbyrne/1280286
  private slugify(text) {
    return text.toString().toLowerCase().trim()
      .replace(/[^\w\s-]/g, '') // remove non-word [a-z0-9_], non-whitespace, non-hyphen characters
      .replace(/[\s_-]+/g, '_') // swap any length of whitespace, underscore, hyphen characters with a single _
      .replace(/^-+|-+$/g, ''); // remove leading, trailing -
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
