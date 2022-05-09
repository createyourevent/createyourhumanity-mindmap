import { $assert } from '@wisemapping/core-js';
import ControlType from './ControlType';
import ControlModel from './ControlModel';
import TextfieldModel from './control/TextfieldModel';
import TextareaModel from './control/TextareaModel';
import SelectModel from './control/SelectModel';
import RadioModel from './control/RadioModel';
import CheckboxModel from './control/CheckboxModel';
import LayoutType from './LayoutType';
import LayoutModel from './LayoutModel';
import ContainerModel from './layout/ContainerModel';
import RowModel from './layout/RowModel';
import ColumnModel from './layout/ColumnModel';
import TitleModel from './layout/TitleModel';
import HrModel from './layout/HrModel';
import DescriptionModel from './layout/DescriptionModel';

interface NodeById {
  id: LayoutType,
  model: typeof LayoutModel;
}

class LayoutModelFactory {
  static modelById: Array<NodeById> = [{
    id: 'container',
    model: ContainerModel,
  }, {
    id: 'row',
    model: RowModel,
  }, {
    id: 'column',
    model: ColumnModel,
  }, {
    id: 'title',
    model: TitleModel,
  }, {
    id: 'hr',
    model: HrModel,
  }, {
    id: 'desc',
    model: DescriptionModel,
  }];

  static createModel(type: LayoutType, attributes): LayoutModel {
    $assert(type, 'type can not be null');
    $assert(attributes, 'attributes can not be null');

    const { model: Model } = LayoutModelFactory.modelById
      .filter((elem) => elem.id === type)[0];
    return new Model(attributes);
  }

  /**
     * @param id the feature metadata id
     * @return {Boolean} returns true if the given id is contained in the metadata array
     */
  static isSupported(type: string): boolean {
    return LayoutModelFactory.modelById.some((elem) => elem.id === type);
  }
}

export default LayoutModelFactory;
