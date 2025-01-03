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

  test('unsubscribeAll should call all subscription functions and clear the list', () => {
    subscriptionList.unsubscribeAll();
    expect(mockSubscription1).toHaveBeenCalled();
    expect(mockSubscription2).toHaveBeenCalled();
    expect(subscriptionList.getItems()).toEqual([]);
  });
});
