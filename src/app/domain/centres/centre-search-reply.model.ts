import { PagedReplyEntityIds } from '@app/domain/paged-reply.model';
import { Centre } from '@app/domain/centres/centre.model';

export interface CentreSearchReply {

  reply?: PagedReplyEntityIds;

  centres: Centre[];

}
