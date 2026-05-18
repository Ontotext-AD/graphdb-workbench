import {
  MapperFn,
  AutocompleteSearchResult,
} from '@ontotext/workbench-api';
import {AutocompleteYasguiModel} from '../models/autocomplete-yasgui-model';

/**
 * Mapper for AutocompleteSearchResult objects to the expected internal YASGUI autocomplete model.
 */
export const mapAutocompleteSearchResultToYasguiModel: MapperFn<AutocompleteSearchResult, AutocompleteYasguiModel> = (data) => {
  const result: AutocompleteYasguiModel = {
    suggestions: []
  };
  result.suggestions = data?.suggestions.getItems().map((suggestion) => ({
    type: suggestion.getType(),
    value: suggestion.getValue(),
    description: suggestion.getDescription(),
  }));
  return result;
};
