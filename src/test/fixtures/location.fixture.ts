import { Centre, CentreLocationInfo } from '@app/domain/centres';
import { Factory } from '@test/factory';

export namespace LocationFixture {
  export interface LocationsFixture {
    centres: Centre[];
    centreLocations: CentreLocationInfo[];
  }

  export function locationsFixture(factory: Factory): LocationsFixture {
    const centres = [1, 2].map(() =>
      new Centre().deserialize(factory.centre({ locations: [factory.location()] }))
    );
    const centreLocations = centres.map(centre =>
      new CentreLocationInfo().deserialize(factory.centreLocationInfo(centre))
    );
    return { centres, centreLocations };
  }
}
