import { $assert } from '@wisemapping/core-js';
import ControlType from './ControlType';
import ControlModel from './ControlModel';
import TextfieldModel from './control/TextfieldModel';
import TextareaModel from './control/TextareaModel';
import SelectModel from './control/SelectModel';
import RadioModel from './control/RadioModel';
import CheckboxModel from './control/CheckboxModel';
import RadiogroupModel from './control/RadiogroupModel';
import OptionModel from './control/OptionModel';
import CalendarModel from './control/CalendarModel';
import EditorModel from './control/EditorModel';
import TimeModel from './control/TimeModel';
import AddressModel from './control/AddressModel';
import KeywordsModel from './control/KeywordsModel';
import RatingsModel from './control/RatingsModel';

interface NodeById {
  id: ControlType,
  model: typeof ControlModel;
}

class ControlModelFactory {
  static modelById: Array<NodeById> = [{
    id: 'textfield',
    model: TextfieldModel,
  }, {
    id: 'textarea',
    model: TextareaModel,
  }, {
    id: 'select',
    model: SelectModel,
  }, {
    id: 'radio',
    model: RadioModel,
  }, {
    id: 'checkbox',
    model: CheckboxModel,
  }, {
    id: 'radiogroup',
    model: RadiogroupModel,
  }, {
    id: 'option',
    model: OptionModel,
  }, {
    id: 'calendar',
    model: CalendarModel,
  }, {
    id: 'editor',
    model: EditorModel,
  }, {
    id: 'time',
    model: TimeModel,
  }, {
    id: 'address',
    model: AddressModel,
  }, {
    id: 'keywords',
    model: KeywordsModel,
  }, {
    id: 'ratings',
    model: RatingsModel,
  }];

  static createModel(type: ControlType, attributes): ControlModel {
    $assert(type, 'type can not be null');
    $assert(attributes, 'attributes can not be null');

    const { model: Model } = ControlModelFactory.modelById
      .filter((elem) => elem.id === type)[0];
    return new Model(attributes);
  }

  /**
     * @param id the feature metadata id
     * @return {Boolean} returns true if the given id is contained in the metadata array
     */
  static isSupported(type: string): boolean {
    return ControlModelFactory.modelById.some((elem) => elem.id === type);
  }
}

export default ControlModelFactory;
