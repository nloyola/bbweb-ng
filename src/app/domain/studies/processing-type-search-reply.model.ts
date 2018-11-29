import { PagedReplyEntityIds } from '@app/domain/paged-reply.model';
import { ProcessingType } from './processing-type.model';

export interface ProcessingTypeSearchReply {

  reply?: PagedReplyEntityIds;

  processingTypes: ProcessingType[];

}
