import { Factory } from './factory';
import { AnnotationType, AnnotationFactory } from '@app/domain/annotations';

export namespace AnnotationSpecCommon {

  export interface AnnotationOptions {
    readonly annotationType?: AnnotationType;
  }

  export function createAnnotation(options: AnnotationOptions = {}, factory: Factory) {
    const annotationType = (options.annotationType)
      ? options.annotationType : new AnnotationType().deserialize(factory.annotationType());
    const annotation = AnnotationFactory.annotationFromType(annotationType);
    return { annotationType, annotation };
  }

}
