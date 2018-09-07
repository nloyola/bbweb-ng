import { SearchParamsReply } from '@app/domain/search-params-reply.model';
import { Study } from '@app/domain/studies/study.model';

export interface StudySearchReply {

  reply?: SearchParamsReply;

  studies: Study[];

}
