import { Component, OnInit } from '@angular/core';
import { RootStoreState } from '@app/root-store';
import { Store } from '@ngrx/store';

@Component({
  selector: 'app-study-collection',
  templateUrl: './study-collection.component.html',
  styleUrls: ['./study-collection.component.scss']
})
export class StudyCollectionComponent implements OnInit {

  constructor(private store$: Store<RootStoreState.State>) {
  }

  ngOnInit() {
    console.log('study-collection');
  }

}
