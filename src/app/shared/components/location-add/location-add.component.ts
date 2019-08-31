import { Component, OnInit, Input, ViewChild, ElementRef, EventEmitter, Output } from '@angular/core';
import { Location } from '@app/domain';
import { Observable } from 'rxjs';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-location-add',
  templateUrl: './location-add.component.html',
  styleUrls: ['./location-add.component.scss']
})
export class LocationAddComponent implements OnInit {
  /* tslint:disable-next-line:no-input-rename */
  @Input('isSaving') isSaving$: Observable<boolean>;
  /* tslint:enable-next-line:no-input-rename */

  @Input() entityName: string;
  @Input() location: Location;

  @Output() submitted = new EventEmitter<Location>();
  @Output() cancelled = new EventEmitter<any>();

  @ViewChild('nameInput', { static: true }) nameInput: ElementRef;

  title: string;
  form: FormGroup;

  constructor(private formBuilder: FormBuilder) {}

  ngOnInit() {
    this.nameInput.nativeElement.focus();
    if (!this.location) {
      throw new Error('location is not defined');
    }

    this.title = this.location.isNew() ? 'Add Location' : 'Update Location';

    this.form = this.formBuilder.group({
      name: [this.location.name, [Validators.required, Validators.minLength(2)]],
      street: [this.location.street, [Validators.required, Validators.minLength(2)]],
      city: [this.location.city, [Validators.required, Validators.minLength(2)]],
      province: [this.location.province, [Validators.required, Validators.minLength(2)]],
      postalCode: [this.location.postalCode, [Validators.required, Validators.minLength(6)]],
      poBoxNumber: [this.location.poBoxNumber],
      countryIsoCode: [this.location.countryIsoCode, [Validators.required, Validators.minLength(2)]]
    });
  }

  get name() {
    return this.form.get('name');
  }
  get street() {
    return this.form.get('street');
  }
  get city() {
    return this.form.get('city');
  }
  get province() {
    return this.form.get('province');
  }
  get postalCode() {
    return this.form.get('postalCode');
  }
  get poBoxNumber() {
    return this.form.get('poBoxNumber');
  }
  get countryIsoCode() {
    return this.form.get('countryIsoCode');
  }

  onSubmit(): void {
    this.submitted.emit(this.formToLocation());
  }

  onCancel(): void {
    this.cancelled.emit(null);
  }

  private formToLocation(): Location {
    return new Location().deserialize({
      id: this.location ? this.location.id : undefined,
      name: this.form.value.name,
      street: this.form.value.street,
      city: this.form.value.city,
      province: this.form.value.province,
      postalCode: this.form.value.postalCode,
      poBoxNumber: this.form.value.poBoxNumber,
      countryIsoCode: this.form.value.countryIsoCode
    });
  }
}
