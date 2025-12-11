import {ModelList} from '../model-list';

describe('ModelList', () => {
  let modelList: TestModelList;

  beforeEach(() => {
    modelList = new TestModelList([
      new TestModel(1, 'uno', 'Item 1'),
      new TestModel(2, 'dos', 'Item 2'),
      new TestModel(3, 'tres', 'Item 3'),
    ]);
  });

  describe('size', () => {
    test('should return the correct number of items', () => {
      expect(modelList.size()).toBe(3);
    });

    test('should return 0 for empty list', () => {
      const emptyList = new TestModelList();
      expect(emptyList.size()).toBe(0);
    });
  });

  describe('getItems', () => {
    test('should return all items', () => {
      const items = modelList.getItems();

      expect(items).toHaveLength(3);
      expect(items[0].name).toBe('Item 1');
    });

    test('should return empty array for empty list', () => {
      const emptyList = new TestModelList();
      const items = emptyList.getItems();

      expect(items).toHaveLength(0);
    });
  });

  describe('getFirstItem', () => {
    test('should return the first item', () => {
      const firstItem = modelList.getFirstItem();

      expect(firstItem).toBeDefined();
      expect(firstItem?.name).toBe('Item 1');
    });

    test('should return undefined for empty list', () => {
      const emptyList = new TestModelList();
      const firstItem = emptyList.getFirstItem();

      expect(firstItem).toBeUndefined();
    });
  });

  describe('sort', () => {
    test('should sort items by id', () => {
      modelList.sort((a, b) => b.id - a.id);

      const items = modelList.getItems();

      expect(items[0].id).toBe(3);
      expect(items[2].id).toBe(1);
    });
  });

  describe('filter', () => {
    test('should filter items by name', () => {
      const filteredItems = modelList.filter(item => item.name === 'Item 2');

      expect(filteredItems).toHaveLength(1);
      expect(filteredItems[0].name).toBe('Item 2');
    });

    test('should return empty array if no items match', () => {
      const filteredItems = modelList.filter(item => item.name === 'Nonexistent Item');

      expect(filteredItems).toHaveLength(0);
    });
  });

  describe('find', () => {
    test('should find an item by id', () => {
      const item = modelList.find(item => item.id === 2);

      expect(item).toBeDefined();
      expect(item?.name).toBe('Item 2');
    });

    test('should return undefined if item not found', () => {
      const item = modelList.find(item => item.id === 999);

      expect(item).toBeUndefined();
    });
  });

  describe('isEmpty', () => {
    test('should return true if no items', () => {
      const emptyList = new TestModelList();

      expect(emptyList.isEmpty()).toBe(true);
    });

    test('should return false if there are items', () => {
      expect(modelList.isEmpty()).toBe(false);
    });
  });
});

class TestModel {
  constructor(public id: number, public location: string, public name: string) {
  }
}

class TestModelList extends ModelList<TestModel> {
  constructor(items: TestModel[] = []) {
    super(items);
  }
}
