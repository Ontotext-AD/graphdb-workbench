import {SubscriptionList} from '../subscription-list';

describe('SubscriptionList', () => {
  let subscriptionList: SubscriptionList;
  let mockSubscription1: jest.Mock;
  let mockSubscription2: jest.Mock;

  beforeEach(() => {
    mockSubscription1 = jest.fn();
    mockSubscription2 = jest.fn();
    subscriptionList = new SubscriptionList([mockSubscription1, mockSubscription2]);
  });

  test('should initialize with given subscriptions', () => {
    expect(subscriptionList.getItems()).toEqual([mockSubscription1, mockSubscription2]);
  });

  test('add should add a new subscription to the list', () => {
    const newSubscription = jest.fn();
    subscriptionList.add(newSubscription);
    expect(subscriptionList.getItems()).toContain(newSubscription);
  });

  describe('remove', () => {
    test('should remove the given subscription from the list', () => {
      subscriptionList.remove(mockSubscription1);
      expect(subscriptionList.getItems()).not.toContain(mockSubscription1);
      expect(subscriptionList.getItems()).toContain(mockSubscription2);
    });

    test('should not affect other subscriptions when removing one', () => {
      subscriptionList.remove(mockSubscription1);
      expect(subscriptionList.getItems()).toHaveLength(1);
    });

    test('should do nothing when the subscription is not in the list', () => {
      const unknownSubscription = jest.fn();
      subscriptionList.remove(unknownSubscription);
      expect(subscriptionList.getItems()).toEqual([mockSubscription1, mockSubscription2]);
    });

    test('should remove all occurrences when the same subscription was added multiple times', () => {
      subscriptionList.add(mockSubscription1);
      subscriptionList.remove(mockSubscription1);
      expect(subscriptionList.getItems()).not.toContain(mockSubscription1);
    });
  });

  test('unsubscribeAll should call all subscription functions and clear the list', () => {
    subscriptionList.unsubscribeAll();
    expect(mockSubscription1).toHaveBeenCalled();
    expect(mockSubscription2).toHaveBeenCalled();
    expect(subscriptionList.getItems()).toEqual([]);
  });
});
