import { Component, OnInit, Input } from '@angular/core';

// Borrowed from here:
// https://medium.com/medialesson/why-and-how-to-structure-features-in-modules-in-angular-d5602c6436be

@Component({
  selector: 'app-blocking-spinner',
  templateUrl: './blocking-spinner.component.html',
  styleUrls: ['./blocking-spinner.component.scss']
})
export class BlockingSpinnerComponent {
  @Input('fill') fill: string;
  @Input('margin') margin: string;
}
