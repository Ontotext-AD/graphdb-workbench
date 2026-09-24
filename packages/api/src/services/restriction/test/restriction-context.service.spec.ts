import {RestrictionContextService} from '../restriction-context.service';
import {ViewRestriction, ViewRestrictionCondition} from '../../../models/restrictions';

describe('RestrictionContextService', () => {
  let restrictionContextService: RestrictionContextService;

  beforeEach(() => {
    restrictionContextService = new RestrictionContextService();
  });

  test('onIsViewRestrictedChanged should notify the subscriber with false on registration when not yet set', () => {
    // GIVEN: isViewRestricted has not been set

    // WHEN: subscribing to isViewRestricted changes
    const mockCallback = jest.fn();
    restrictionContextService.onIsViewRestrictedChanged(mockCallback);
    // THEN: the subscriber should be notified with false, not undefined
    expect(mockCallback).toHaveBeenLastCalledWith(false);
  });

  test('updateIsViewRestricted should update the isViewRestricted state and notify subscribers', () => {
    // GIVEN: There is a subscriber to isViewRestricted changes
    let actualIsViewRestricted: boolean | undefined;
    const mockCallback = jest.fn((isViewRestricted) => actualIsViewRestricted = isViewRestricted);
    restrictionContextService.onIsViewRestrictedChanged(mockCallback);

    // WHEN: updating isViewRestricted to true
    restrictionContextService.updateIsViewRestricted(true);
    // THEN: the context should be updated and subscribers notified with true
    expect(mockCallback).toHaveBeenLastCalledWith(true);
    expect(actualIsViewRestricted).toBe(true);

    // WHEN: updating isViewRestricted to false
    restrictionContextService.updateIsViewRestricted(false);
    // THEN: the context should be updated and subscribers notified with false
    expect(mockCallback).toHaveBeenLastCalledWith(false);
    expect(actualIsViewRestricted).toBe(false);
  });

  test('should stop receiving isViewRestricted updates after unsubscribe', () => {
    // GIVEN: There is a subscription to isViewRestricted changes
    const mockCallback = jest.fn();
    const unsubscribe = restrictionContextService.onIsViewRestrictedChanged(mockCallback);
    // Clear the callback call when the callback function is registered
    mockCallback.mockClear();

    // WHEN: unsubscribing from isViewRestricted changes
    unsubscribe();
    // AND: updating isViewRestricted to true
    restrictionContextService.updateIsViewRestricted(true);
    // THEN: the subscriber should not be notified
    expect(mockCallback).not.toHaveBeenCalled();
  });

  test('isViewRestricted should return the isViewRestricted value from the context', () => {
    // WHEN: updating isViewRestricted to true
    restrictionContextService.updateIsViewRestricted(true);
    // THEN: the snapshot should return true
    expect(restrictionContextService.isViewRestricted()).toBe(true);

    // WHEN: updating isViewRestricted to false
    restrictionContextService.updateIsViewRestricted(false);
    // THEN: the snapshot should return false
    expect(restrictionContextService.isViewRestricted()).toBe(false);
  });

  test('isViewRestricted should return false when not set', () => {
    // GIVEN: isViewRestricted has not been set

    // WHEN: getting the isViewRestricted snapshot
    // THEN: the snapshot should default to false
    expect(restrictionContextService.isViewRestricted()).toBe(false);
  });

  test('viewRestriction should return the view restriction from the context', () => {
    // GIVEN: a view restriction is set in the context
    const newViewRestriction = new ViewRestriction({restrictions: [ViewRestrictionCondition.FEDX]});
    restrictionContextService.updateViewRestriction(newViewRestriction);

    // WHEN: getting the view restriction snapshot
    // THEN: the snapshot should equal the view restriction that was set
    expect(restrictionContextService.viewRestriction()).toEqual(newViewRestriction);
  });

  test('viewRestriction should return undefined when not set', () => {
    // GIVEN: a view restriction has not been set

    // WHEN: getting the view restriction snapshot
    // THEN: the snapshot should return undefined
    expect(restrictionContextService.viewRestriction()).toBeUndefined();
  });
});
