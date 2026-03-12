import {InteractiveGuide} from '../../../../models/interactive-guide/interactive-guide';
import {InteractiveGuideResponse} from '../../../../models/interactive-guide/interactive-guide-response';
import {MapperFn} from '../../../../providers/mapper/mapper-fn';

/**
 * Maps an array of InteractiveGuideResponse objects to an array of InteractiveGuide objects.
 *
 * @param guides - The array of InteractiveGuideResponse objects to be mapped.
 */
export const mapInteractiveGuideListResponseToModel: MapperFn<InteractiveGuideResponse[] | undefined, InteractiveGuide[]> = (guides = []) => {

  return guides.map((guide, index) => {
    const guideId = guide.guideId === undefined ? String(Date.now() + index) : String(guide.guideId);
    return new InteractiveGuide({
      guideId,
      guideName: guide.guideName,
      guideDescription: guide.guideDescription,
      options: guide.options,
      steps: guide.steps,
      guideOrder: guide.guideOrder,
      guideLevel: guide.guideLevel
    });
  });
};
