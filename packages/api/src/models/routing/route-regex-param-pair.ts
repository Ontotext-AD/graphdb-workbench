import {ModelList} from '../common';

/**
 * Represents a pair of a regular expression and its associated route parameters.
 * This class is used for route matching and parameter extraction for the plugin system.
 */
export class RouteRegexParamPair {
  private regex!: RegExp;
  private routeParams!: ModelList<string>;

  constructor(regex: RegExp, routeParams: ModelList<string>) {
    this.setRegex(regex);
    this.setRouteParams(routeParams);
  }

  getRegex(): RegExp {
    return this.regex;
  }

  setRegex(regex: RegExp): RouteRegexParamPair {
    this.regex = regex;
    return this;
  }

  getRouteParams(): ModelList<string> {
    return this.routeParams;
  }

  setRouteParams(routeParams: ModelList<string>): RouteRegexParamPair {
    this.routeParams = routeParams;
    return this;
  }
}
