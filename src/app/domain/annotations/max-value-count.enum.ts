export enum MaxValueCount {
  /**
   * Used if {@link domain.annotations.AnnotationType#valueType valueType} for annotation type is not {@link
   */
  None = 0,

  /**
   * Used when {@link domain.annotations.AnnotationType#valueType valueType} for annotation type is {@link
   * domain.AnnotationValueType.SELECT SELECT} and only a single value can be chosen.
   */
  SelectSingle = 1,

  /**
   * Used when {@link domain.annotations.AnnotationType#valueType valueType} for annotation type is {@link
   * domain.AnnotationValueType.SELECT SELECT} and multiple values can be chosen.
   */
  SelectMultiple = 2
}
