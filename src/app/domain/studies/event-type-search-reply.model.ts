import { PagedReplyEntityIds } from '@app/domain/paged-reply.model';
import { CollectionEventType } from './collection-event-type.model';

export interface EventTypeSearchReply {

  reply?: PagedReplyEntityIds;

  eventTypes: CollectionEventType[];

}
