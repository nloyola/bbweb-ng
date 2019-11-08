import { Component, OnInit } from '@angular/core';
import { BlockingProgressService } from '@app/core/services/blocking-progress.service';

// Borrowed from here:
// https://medium.com/medialesson/why-and-how-to-structure-features-in-modules-in-angular-d5602c6436be

@Component({
  selector: 'app-blocking-progress',
  templateUrl: './blocking-progress.component.html',
  styleUrls: ['./blocking-progress.component.scss']
})
export class BlockingProgressComponent implements OnInit {
  isLoading: boolean = false;
  loadingMessage: string;

  constructor(private blockingProgressService: BlockingProgressService) {}

  ngOnInit() {
    this.blockingProgressService.isLoading$.subscribe(value => {
      this.isLoading = value;
    });
    this.blockingProgressService.loadingMessage$.subscribe(value => {
      this.loadingMessage = value;
    });
  }
}
