import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-study-add',
  templateUrl: './study-add.component.html',
  styleUrls: ['./study-add.component.scss']
})
export class StudyAddComponent implements OnInit {

  private studyForm: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router) { }

  ngOnInit() {
    this.studyForm = this.formBuilder.group(
      {
        name: ['', [Validators.required]],
        description: ['']
      });
  }

  get name() {
    return this.studyForm.get('name');
  }

  get description() {
    return this.studyForm.get('description');
  }

  private onSubmit() {
    console.log(this.studyForm.value);
  }

  private onCancel() {
    this.navigateToReturnUrl();
  }

  private navigateToReturnUrl() {
    this.router.navigate(['/admin/studies']);
  }

}
