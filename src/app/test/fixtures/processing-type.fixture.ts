import { Study, ProcessingType, CollectionEventType, ProcessedSpecimenDefinitionName, CollectedSpecimenDefinitionName, SpecimenDefinitionName } from '@app/domain/studies';
import { Factory } from '../factory';

export class ProcessingTypeFixture {

  constructor(protected factory: Factory) {}

  createEntities(): { study: Study, processingType: ProcessingType } {
    const study = new Study().deserialize(this.factory.study());
    const annotationType = this.factory.annotationType();
    const processingType = new ProcessingType().deserialize({
      ...this.factory.processingType(),
      annotationTypes: [ annotationType ]
    });

    return {
      study,
      processingType
    };
  }

  createProcessingTypeFromCollected(): { eventType: CollectionEventType, processingType: ProcessingType } {
    const processingType = new ProcessingType().deserialize(this.factory.processingType());
    const eventType = new CollectionEventType().deserialize(this.factory.defaultCollectionEventType());
    return { eventType, processingType };
  }

  createProcessingTypeFromProcessed(): { input: ProcessingType, processingType: ProcessingType } {
    const inputPt = new ProcessingType().deserialize(this.factory.processingType());
    const processingType = new ProcessingType().deserialize(this.factory.processingType({
      input: {
        definitionType: 'processed',
        entityId: inputPt.id,
        specimenDefinitionId: inputPt.output.specimenDefinition.id
      }
    }));
    return { input: inputPt, processingType };
  }

  collectedDefinitionNames(eventTypes: CollectionEventType[]): CollectedSpecimenDefinitionName[] {
    return eventTypes.map(et => new CollectedSpecimenDefinitionName().deserialize({
      id: et.id,
      slug: et.slug,
      name: et.name,
      specimenDefinitionNames: et.specimenDefinitions.map(sd => new SpecimenDefinitionName().deserialize({
        id: sd.id,
        slug: sd.slug,
        name: sd.name,
      }))
    }));
  }

  processedDefinitionNames(processingTypes: ProcessingType[]): ProcessedSpecimenDefinitionName[] {
    return processingTypes.map(pt => new ProcessedSpecimenDefinitionName().deserialize({
      id: pt.id,
      slug: pt.slug,
      name: pt.name,
      specimenDefinitionName: {
        id: pt.output.specimenDefinition.id,
        slug: pt.output.specimenDefinition.slug,
        name: pt.output.specimenDefinition.name,
      }
    }));
  }

}
