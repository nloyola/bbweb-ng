import { PagedReplyEntityIds } from '@app/domain/paged-reply.model';
import { Study } from '@app/domain/studies/study.model';

export interface StudySearchReply {

  reply?: PagedReplyEntityIds;

  studies: Study[];

}
