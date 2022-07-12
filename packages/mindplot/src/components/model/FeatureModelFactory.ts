import { $assert } from '@wisemapping/core-js';
import IconModel from './IconModel';
import LinkModel from './LinkModel';
import NoteModel from './NoteModel';
import FeatureModel from './FeatureModel';
import FeatureType from './FeatureType';
import HtmlFormModel from './form/HtmlFormModel';
import HtmlStepModel from './form/HtmlStepModel';
import HtmlTabsPlusModel from './form/HtmlTabsPlusModel';
import HtmlTabsFormModel from './form/HtmlTabsFormModel';
import HtmlMultistepFormModel from './form/HtmlMultistepFormModel';
import VisibleIconModel from './VisibleIconModel';

interface NodeById {
  id: FeatureType,
  model: typeof FeatureModel;
}

class FeatureModelFactory {
  static modelById: Array<NodeById> = [{
    id: 'icon',
    model: IconModel,
  }, {
    id: 'link',
    model: LinkModel,
  }, {
    id: 'note',
    model: NoteModel,
  }, {
    id: 'htmlForm',
    model: HtmlFormModel,
  }, {
    id: 'htmlTabsForm',
    model: HtmlTabsFormModel,
  }, {
    id: 'htmlMultistepForm',
    model: HtmlMultistepFormModel,
  }, {
    id: 'htmlFormStep',
    model: HtmlStepModel,
  }, {
    id: 'htmlFormTab',
    model: HtmlTabsPlusModel,
  }, {
    id: 'visible',
    model: VisibleIconModel,
  }];

  static createModel(type: FeatureType, attributes): FeatureModel {
    $assert(type, 'type can not be null');
    $assert(attributes, 'attributes can not be null');

    const { model: Model } = FeatureModelFactory.modelById
      .filter((elem) => elem.id === type)[0];
    return new Model(attributes);
  }

  /**
     * @param id the feature metadata id
     * @return {Boolean} returns true if the given id is contained in the metadata array
     */
  static isSupported(type: string): boolean {
    return FeatureModelFactory.modelById.some((elem) => elem.id === type);
  }
}

export default FeatureModelFactory;
