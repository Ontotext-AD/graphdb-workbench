import { ModelList } from '../model-list';

describe('ModelList', () => {
  let modelList: TestModelList;

  beforeEach(() => {
    modelList = new TestModelList([
      new TestModel(1, 'Item 1'),
      new TestModel(2, 'Item 2'),
      new TestModel(3, 'Item 3'),
    ]);
  });

  test('getItems should return all items', () => {
    const items = modelList.getItems();

    expect(items).toHaveLength(3);
    expect(items[0].name).toBe('Item 1');
  });

  test('sort should sort items by id', () => {
    modelList.sort((a, b) => b.id - a.id);

    const items = modelList.getItems();

    expect(items[0].id).toBe(3);
    expect(items[2].id).toBe(1);
  });

  test('filter should filter items by name', () => {
    const filteredItems = modelList.filter(item => item.name === 'Item 2');

    expect(filteredItems).toHaveLength(1);
    expect(filteredItems[0].name).toBe('Item 2');
  });

  test('find should find an item by id', () => {
    const item = modelList.find(item => item.id === 2);

    expect(item).toBeDefined();
    expect(item?.name).toBe('Item 2');
  });

  test('isEmpty should return true if no items', () => {
    const emptyList = new TestModelList();

    expect(emptyList.isEmpty()).toBe(true);
  });

  test('isEmpty should return false if there are items', () => {
    expect(modelList.isEmpty()).toBe(false);
  });

  test('createIdFilter should filter out items with specified ids', () => {
    const idFilter = modelList.getIdFilter([1, 3]);
    const filteredItems = modelList.filter(idFilter);
    expect(filteredItems).toHaveLength(1);
    expect(filteredItems[0].id).toBe(2);
  });
});

class TestModel {
  constructor(public id: number, public name: string) {}
}

class TestModelList extends ModelList<TestModel> {
  constructor(items: TestModel[] = []) {
    super(items);
  }

  public getIdFilter(ids: number[]): (item: TestModel) => boolean {
    return this.createIdFilter(ids);
  }
}
