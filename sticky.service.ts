import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { StuckElement } from './sticky.interface';

@Injectable({
  providedIn: 'root'
})
export class StickyService {
  private stuckElements: StuckElement[] = [];
  private stuckElementsSubject = new Subject<StuckElement[]>();
  public stuckElements$ = this.stuckElementsSubject.asObservable();

  constructor() {}

  /**
   * Adding to Stuck Elements array
   * Unstucking all previous stuckElements
   * Returning added element ID
   *
   * @return number
   */
  public addStuckElement(): number {
    // setUnstuck all stuckElements
    this.stuckElements.forEach((element, index) => this.setUnstuck(index));
    this.stuckElements.push({
      id: this.stuckElements.length,
      unstuck: false
    });
    this.stuckElementsSubject.next(this.stuckElements);
    return this.stuckElements.length - 1;
  }

  /**
   * Removing from stuckElements
   * removeUnstuck last stuckElements
   * 
   * @param id
   * 
   * @return void
   */
  public removeStuckElement(id: number): void {
    this.stuckElements.splice(id, 1);
    this.removeUnstuck(this.stuckElements.length - 1);
    this.stuckElementsSubject.next(this.stuckElements);
  }

  /**
   * @param id number
   * 
   * @return void
   */
  private setUnstuck(id: number): void {
    if (this.stuckElements[id]) {
      this.stuckElements[id].unstuck = true;
    }
  }

  /**
   * @param id number
   * 
   * @return void
   */
  private removeUnstuck(id: number): void {
    if (this.stuckElements[id]) {
      this.stuckElements[id].unstuck = false;
    }
  }
}
