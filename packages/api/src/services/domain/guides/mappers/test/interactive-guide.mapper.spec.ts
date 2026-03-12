import {InteractiveGuide} from '../../../../../models/interactive-guide/interactive-guide';
import {InteractiveGuideResponse} from '../../../../../models/interactive-guide/interactive-guide-response';
import {mapInteractiveGuideListResponseToModel} from '../interactive-guide.mapper';

describe('InteractiveGuideMapper', () => {
  test('should return an empty array when called with undefined', () => {
    const result = mapInteractiveGuideListResponseToModel(undefined);

    expect(result).toEqual([]);
  });

  test('should return an empty array when called with an empty array', () => {
    const result = mapInteractiveGuideListResponseToModel([]);

    expect(result).toEqual([]);
  });

  test('should map a guide with a string guideId correctly', () => {
    const guide: InteractiveGuideResponse = {
      guideId: 'my-guide-id',
      guideName: 'My Guide',
      guideDescription: 'A description',
      options: {},
      steps: []
    };

    const result = mapInteractiveGuideListResponseToModel([guide]);

    expect(result).toHaveLength(1);
    expect(result[0]).toBeInstanceOf(InteractiveGuide);
    expect(result[0].guideId).toBe('my-guide-id');
    expect(result[0].guideName).toBe('My Guide');
    expect(result[0].guideDescription).toBe('A description');
    expect(result[0].options).toEqual({});
    expect(result[0].steps).toEqual([]);
  });

  test('should convert a numeric guideId to a string', () => {
    const guide: InteractiveGuideResponse = {
      guideId: 42,
      guideName: 'Numeric ID Guide',
      guideDescription: 'Description',
      options: {},
      steps: []
    };

    const result = mapInteractiveGuideListResponseToModel([guide]);

    expect(result).toHaveLength(1);
    expect(result[0]).toBeInstanceOf(InteractiveGuide);
    expect(result[0].guideId).toBe('42');
  });

  test('should generate a guideId when guideId is undefined', () => {
    const guide: InteractiveGuideResponse = {
      guideId: undefined,
      guideName: 'No ID Guide',
      guideDescription: 'Description',
      options: {},
      steps: []
    };

    const result = mapInteractiveGuideListResponseToModel([guide]);

    expect(result).toHaveLength(1);
    expect(result[0]).toBeInstanceOf(InteractiveGuide);
    expect(result[0].guideId).toBeTruthy();
    expect(typeof result[0].guideId).toBe('string');
  });

  test('should generate unique guideIds for multiple guides with undefined guideId', () => {
    const guides: InteractiveGuideResponse[] = [
      {guideId: undefined, guideName: 'Guide 1', guideDescription: '', options: {}, steps: []},
      {guideId: undefined, guideName: 'Guide 2', guideDescription: '', options: {}, steps: []}
    ];

    const result = mapInteractiveGuideListResponseToModel(guides);

    expect(result).toHaveLength(2);
    expect(result[0].guideId).not.toBe(result[1].guideId);
  });

  test('should map multiple guides correctly', () => {
    const guides: InteractiveGuideResponse[] = [
      {guideId: 'guide-1', guideName: 'Guide One', guideDescription: 'Desc 1', options: {}, steps: []},
      {guideId: 2, guideName: 'Guide Two', guideDescription: 'Desc 2', options: {}, steps: []},
    ];

    const result = mapInteractiveGuideListResponseToModel(guides);

    expect(result).toHaveLength(2);
    expect(result[0]).toBeInstanceOf(InteractiveGuide);
    expect(result[0].guideId).toBe('guide-1');
    expect(result[1]).toBeInstanceOf(InteractiveGuide);
    expect(result[1].guideId).toBe('2');
  });
});
