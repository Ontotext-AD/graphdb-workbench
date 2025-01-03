import { Model } from '../model';

describe('Model', () => {
  test('copy should create a deep copy of the model instance', () => {
    const original = new TestModel({ key: 'value' });
    const copy = original.copy();

    expect(copy).toEqual(original);
    expect(copy).not.toBe(original);
    expect(copy.data).not.toBe(original.data);
  });

  test('copy should create a deep copy with nested objects', () => {
    const original = new TestModel({ nested: { key: 'value' } });
    const copy = original.copy();

    expect(copy.data.nested).toEqual(original.data.nested);
    expect(copy.data.nested).not.toBe(original.data.nested);
  });

  test('copy should create a deep copy with arrays', () => {
    const original = new TestModel({ array: [1, 2, 3] });
    const copy = original.copy();

    expect(copy.data.array).toEqual(original.data.array);
    expect(copy.data.array).not.toBe(original.data.array);
  });
});

class TestModel extends Model<TestModel> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(public data: any) {
    super();
  }
}
