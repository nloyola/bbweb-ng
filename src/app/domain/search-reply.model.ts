import { PagedReplyEntityIds } from '@app/domain/paged-reply.model';
import { DomainEntity } from './domain-entity.model';

export interface SearchReply<T extends DomainEntity> {

  reply?: PagedReplyEntityIds;

  entities: T[];

}
