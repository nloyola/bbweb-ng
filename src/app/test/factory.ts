import { User, UserState } from '@app/domain/users';

import * as faker from 'faker'
import * as _ from "lodash";

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

export class Factory {

  private defaultEntities = new Map();

  stringNext() {
    return this.domainEntityNameNext();
  }

  user(options: any = { membership: undefined }) {
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

  defaultUser() {
    const dflt = this.defaultEntities.get(DomainEntities.USER);
    return dflt ? dflt : this.user();
  }

  membershipBase(options?: any) {
    const defaults = this.membershipBaseDefaults();
    const m = {
      ...defaults,
      ...this.commonFields(),
      ...options
    };
    this.defaultEntities.set(DomainEntities.MEMBERSHIP_BASE, m);
    return m;
  }

  defaultMembershipBase() {
    const dflt = this.defaultEntities.get(DomainEntities.MEMBERSHIP_BASE);
    return dflt ? dflt : this.membershipBase();
  }

  userMembership(options?: any) {
    return this.membershipBase(options);
  }

  accessItem(options = {}) {
    const defaults = this.accessItemDefaults();
    const item = {
      ...defaults,
      ...this.commonFields(),
      ...options
    };
    this.defaultEntities.set(DomainEntities.ACCESS_ITEM, item);
    return item;
  }

  role(options?: any) {
    const role = {
      ...{ userData: [this.entityInfo()] },
      ...this.accessItem(options),
      ...options
    };
    this.defaultEntities.set(DomainEntities.ROLE, role);
    return role;
  }

  defaultRole() {
    const dflt = this.defaultEntities.get(DomainEntities.ROLE);
    return dflt ? dflt : this.role();
  }

  userRole() {
    const role = this.defaultRole(),
      userRole = _.omit(role, ['userData', 'parentData']);
    return userRole;
  }

  entityInfo() {
    return {
      ...{ id: this.stringNext() },
      ...this.nameAndSlug()
    };
  }

  entitySet() {
    return { allEntities: false, entityData: [this.entityInfo()] };
  }

  private domainEntityNameNext(domainEntityType?: string) {
    let id = domainEntityType ? domainEntityType : 'string';
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
    const name = this.stringNext()
    return {
      slug: this.slugify(name),
      name: name
    }
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
