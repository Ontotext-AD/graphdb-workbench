import {Placement} from 'tippy.js';

/**
 * Holds all tooltip configurations related to tippy.js properties.
 */
export class OntoTooltipConfiguration {

  /**
   * Determines if the tooltip hides upon clicking the reference.
   */
  hideOnClick = false;

  /**
   * The content of the tooltip.
   */
  content: string;
  /**
   * Determines the events that cause the tooltip to show. Multiple event names are separated by spaces.
   */
  trigger = 'manual';

  /**
   * The preferred placement of the tooltip. Note that Popper's flip modifier can change this to the opposite placement if it has more space.
   */
  placement: Placement;

  /**
   * Determines if content strings are parsed as HTML instead of text.
   */
  allowHTML = true;

  /**
   * Determines the theme of the tooltip element.Themes are created by including a class on the tippy-box element as part of a selector in the form .tippy-box[data-theme~='onto-tooltip']
   */
  theme = 'onto-tooltip';

  /**
   * Invoked once the tooltip begins to show.
   */
  onShow = () => document.querySelectorAll('.jfk-tooltip').forEach(popper => popper.classList.add('hidden'))

  /**
   * Invoked once the tooltip begins to hide.
   */
  onHide = () => document.querySelectorAll('.jfk-tooltip').forEach(popper => popper.classList.remove('hidden'));

  constructor() {
  }

  setHideOnClick(hideOnClick: boolean): OntoTooltipConfiguration {
    this.hideOnClick = hideOnClick;
    return this;
  }

  setContent(content: string): OntoTooltipConfiguration {
    this.content = content;
    return this;
  }

  setTrigger(trigger: Placement): OntoTooltipConfiguration {
    this.trigger = trigger || 'manual';
    return this;
  }

  setPlacement(placement: Placement): OntoTooltipConfiguration {
    this.placement = placement;
    return this;
  }

  setAllowHTML(allowHtml: boolean): OntoTooltipConfiguration {
    this.allowHTML = allowHtml;
    return this;
  }

  setTheme(theme: string): OntoTooltipConfiguration {
    this.theme = theme || 'onto-tooltip';
    return this;
  }
}
