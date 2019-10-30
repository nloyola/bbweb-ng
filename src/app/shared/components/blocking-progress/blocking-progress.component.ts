import { Component, OnInit } from '@angular/core';
import { BlockingProgressService } from '@app/core/services';

@Component({
  selector: 'app-blocking-progress',
  templateUrl: './blocking-progress.component.html',
  styleUrls: ['./blocking-progress.component.scss']
})
export class BlockingProgressComponent implements OnInit {
  isLoading: boolean = false;
  loadingMessage: string;

  constructor(private _blockingProgressService: BlockingProgressService) {}

  ngOnInit() {
    this._blockingProgressService.isLoading$.subscribe(value => {
      this.isLoading = value;
    });
    this._blockingProgressService.loadingMessage$.subscribe(value => {
      this.loadingMessage = value;
    });
  }
}
