import { ComponentFixture } from '@angular/core/testing';
import { ShipmentSpecimen } from '@app/domain/shipments';
import { UnpackedShipmentSpeciemensComponent } from '@app/modules/shipping/components/unpacked-shipment-specimens/unpacked-shipment-specimens.component';
import { Factory } from '@test/factory';

export namespace UnpackShipmentSpecimenBehaviour {
  export interface Context<C extends UnpackedShipmentSpeciemensComponent> {
    fixture?: ComponentFixture<C>;
    component?: C;
  }

  export function sharedBehaviour<C extends UnpackedShipmentSpeciemensComponent>(
    context: Context<C>,
    factory: Factory
  ) {
    it('throws an error if an invalid action is reported', () => {
      const invalidAction = factory.stringNext();
      const shipmenSpecimen = new ShipmentSpecimen().deserialize(factory.shipmentSpecimen());
      context.fixture.detectChanges();
      expect(() => {
        context.component.shipmentSpecimenAction([shipmenSpecimen, invalidAction]);
      }).toThrowError(`action ${invalidAction} is not handled`);
    });
  }
}
