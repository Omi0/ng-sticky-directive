export interface StickyConfig {
  /**
   * By default class "stuck" is added to sticky elements
   */
  stuckClass: string;

  /**
   * By default class "unstuck" is added to unstuck elements
   */
  unstuckClass: string;

  /**
   * By default style="position: fixed; top: 0px; left: 0px; right: 0px;"
   * to remove default style set useDefaultStyle to false
   */
  useDefaultStyle: boolean;
}
