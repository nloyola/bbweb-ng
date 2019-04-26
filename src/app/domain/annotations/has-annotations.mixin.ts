import { ConcurrencySafeEntity } from '@app/domain/concurrency-safe-entity.model';
import { AnnotationType } from './annotation-type.model';
import { Annotation } from './annotation.model';
import { annotationFactory } from './annotation-factory';
import { JSONObject } from '../json-object.model';

export class HasAnnotations {

  annotations: Annotation[] = [];

  /**
   * Assigns the {@link app.domain.annotations.AnnotationType AnnotationType} to the parent
   * entity and converts the annotations to the matching objects derived from {@link
   * app.domain.annotations.Annotation Annotation}.
   *
   * @see app.domain.annotations.DateTimeAnnotation
   * @see app.domain.annotations.MultipleSelectAnnotation
   * @see app.domain.annotations.NumberAnnotation
   * @see app.domain.annotations.SingleSelectAnnotation
   * @see app.domain.annotations.TextAnnotation
   */
  setAnnotationTypes(annotationTypes: AnnotationType[]): void {
    const validIds = annotationTypes.map(at => at.id);
    const invalidIds = [];

    this.annotations.forEach(a => {
      if (!validIds.includes(a.annotationTypeId)) {
        invalidIds.push(a.annotationTypeId);
      }
    });

    if (invalidIds.length > 0) {
      throw new Error('annotation types not found: ' + invalidIds.join(', '));
    }

    this.annotations = annotationTypes.map((annotationType: AnnotationType) => {
      const annotation = this.annotations.find(a => a.annotationTypeId === annotationType.id);
      if (!annotation) {
        throw new Error('annotation not found for id: ' + annotationType.id);
      }
      annotation.annotationType = annotationType;
      return annotation;
    });
  }
}
