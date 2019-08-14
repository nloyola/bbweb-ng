import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-shipment-add-specimens-card',
  templateUrl: './shipment-add-specimens-card.component.html',
  styleUrls: ['./shipment-add-specimens-card.component.scss']
})
export class ShipmentAddSpecimensCardComponent implements OnInit {
  form: FormGroup;

  constructor(private formBuilder: FormBuilder) {}

  ngOnInit() {
    this.form = this.formBuilder.group({
      inventoryIds: ['', [Validators.required]]
    });
  }

  onSubmit() {
    // FIXME: needs implementation
  }
}
