import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { TruncatePipe } from '@app/shared/pipes';

@Component({
  selector: 'app-truncate-toggle',
  templateUrl: './truncate-toggle.component.html',
  styleUrls: ['./truncate-toggle.component.scss']
})
export class TruncateToggleComponent implements OnInit, OnChanges {

  @Input() text: string;
  @Input() toggleLength: number;
  @Input() textEmptyWarning: string;

  private showLessLabel = 'Show less';
  private showMoreLabel = 'Show more';
  private toggleRequired: boolean;
  private truncatePipe = new TruncatePipe();

  displayText: string;
  toggleState = false;
  buttonLabel = this.showLessLabel;

  constructor() {}

  ngOnInit() {
    this.determineDisplayText();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.text) {
      this.text = changes.text.currentValue;
      this.toggleRequired = (this.text.length > this.toggleLength);
      this.determineDisplayText();
    }
  }

  toggleText() {
    this.toggleState = !this.toggleState;
    this.determineDisplayText();
    this.buttonLabel = this.toggleState ? this.showMoreLabel : this.showLessLabel;
  }

  determineDisplayText() {
    this.displayText = this.toggleState ?
      this.truncatePipe.transform(this.text, this.toggleLength) : this.text;
  }

}
