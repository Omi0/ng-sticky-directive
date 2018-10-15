import {
  Directive,
  ElementRef,
  OnDestroy,
  Renderer2,
  HostListener,
  Input,
  AfterViewInit
} from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import { filter, map } from 'rxjs/operators';
import { StickyService } from './sticky.service';
import { StuckElement } from './sticky.interface';
import { StickyConfig } from './sticky.config';

/**
 * Sticking elements to top on scroll as elements reaches top
 * Multiple sticky elements replaces each other while scrolling
 * Child nodes of sticky element will be wrapped around div.sticky-content element
 *
 * HOW TO USE:
 * add 'sticky' directive to element
 * custom configs can be passed via [stickyConfig]
 *
 * EXAMPLE:
 * <div sticky [stickyConfig]="{stuckClass: 'custom-sticky-style', useDefaultStyle: false}"></div>
 */
@Directive({
  selector: '[sticky]'
})
export class StickyDirective implements AfterViewInit, OnDestroy {
  @Input()
  stickyConfig: StickyConfig;
  private config: StickyConfig = {
    stuckClass: 'stuck',
    unstuckClass: 'unstuck',
    useDefaultStyle: true
  };
  private hasStuck: boolean = false;
  private hasUnstuck: boolean = false;
  private elementId: number;
  private elementContent: HTMLElement;
  private elementsSubscription: Subscription;

  constructor(
    private elementRef: ElementRef,
    private renderer: Renderer2,
    private stickyService: StickyService
  ) {}

  ngAfterViewInit() {
    // Wrapping child nodes with div.sticky-content element
    this.wrapElementContent();

    // Subscribing to stuckElements$ Observable
    this.elementsSubscription = this.stickyService.stuckElements$
      .pipe(
        map(elements =>
          // Subscribing only to current elements
          elements.find(element => element.id === this.elementId)
        ),
        // Filtering only elements whos unstuck status has changed
        filter(element => element && element.unstuck !== this.hasUnstuck)
      )
      .subscribe((element: StuckElement) => {
        this.hasUnstuck = element.unstuck;
        if (this.hasUnstuck == true) this.unstick(true);
        if (this.hasUnstuck == false) this.stick(true);
      });

    // Observing element sticky status
    this.observer();
  }

  ngOnDestroy() {
    if (this.elementsSubscription) this.elementsSubscription.unsubscribe();
    if (this.elementId) {
      this.stickyService.removeStuckElement(this.elementId);
      this.elementId = undefined;
    }
  }

  @HostListener('window:scroll', ['$event'])
  onWindowScroll(event) {
    this.observer();
  }

  private observer(): void {
    // If this element hasUnstuck - then we don't have to observe it anymore
    if (this.hasUnstuck === true) return;

    let offsetTop = this.elementRef.nativeElement.getBoundingClientRect().top;
    if (offsetTop <= 0 && this.hasStuck === false) {
      this.elementId = this.stickyService.addStuckElement();
      this.stick();
    }
    if (offsetTop > 0 && this.hasStuck == true) {
      this.unstick();
      this.stickyService.removeStuckElement(this.elementId);
      this.elementId = undefined;
    }
  }

  private stick(removeUnstuckClass: boolean = false): void {
    this.hasStuck = true;
    this.renderer.addClass(
      this.elementRef.nativeElement,
      this.config.stuckClass
    );
    this.renderer.setStyle(
      this.elementRef.nativeElement,
      'height',
      this.elementContent.offsetHeight + 'px'
    );
    if (this.config.useDefaultStyle) {
      this.renderer.setStyle(this.elementContent, 'position', 'fixed');
      this.renderer.setStyle(this.elementContent, 'top', '0px');
      this.renderer.setStyle(this.elementContent, 'left', '0px');
      this.renderer.setStyle(this.elementContent, 'right', '0px');
    }
    if (removeUnstuckClass)
      this.renderer.removeClass(
        this.elementRef.nativeElement,
        this.config.unstuckClass
      );
  }

  private unstick(addUnstuckClass: boolean = false): void {
    this.hasStuck = false;
    this.renderer.removeClass(
      this.elementRef.nativeElement,
      this.config.stuckClass
    );
    this.renderer.removeStyle(this.elementRef.nativeElement, 'height');
    if (this.config.useDefaultStyle) {
      this.renderer.removeStyle(this.elementContent, 'position');
      this.renderer.removeStyle(this.elementContent, 'top');
      this.renderer.removeStyle(this.elementContent, 'left');
      this.renderer.removeStyle(this.elementContent, 'right');
    }
    if (addUnstuckClass)
      this.renderer.addClass(
        this.elementRef.nativeElement,
        this.config.unstuckClass
      );
  }

  private wrapElementContent() {
    var stickyContent = this.renderer.createElement('div');
    this.renderer.addClass(stickyContent, 'sticky-content');
    // Moving childNodes of nativeElement to div.sticky-content
    while (this.elementRef.nativeElement.childNodes.length > 0) {
      this.renderer.appendChild(
        stickyContent,
        this.elementRef.nativeElement.childNodes[0]
      );
    }
    this.renderer.appendChild(this.elementRef.nativeElement, stickyContent);

    // Setting elementContent value
    this.elementContent = stickyContent;
  }
}
