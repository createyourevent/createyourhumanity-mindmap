import HtmlTabsFormImage from '../../../assets/icons/html/tab-form.png';
import Icon from '../Icon';
import FeatureModel from '../model/FeatureModel';
import Topic from '../Topic';
import { $assert } from '@wisemapping/core-js';
import ControlModel from '../model/ControlModel';
import ActionDispatcher from '../ActionDispatcher';
import HtmlFormModel from '../model/form/HtmlFormModel';
import LayoutModel from '../model/LayoutModel';

class HtmlTabsFormElementIcon extends Icon {
    private _htmlElementModel: FeatureModel;

    private _topic: Topic;
  
    private _readOnly: boolean;
    
    constructor(topic: Topic, htmlElementModel: HtmlFormModel, readOnly: boolean) {
        $assert(topic, 'topic can not be null');
        $assert(htmlElementModel, 'linkModel can not be null');
    
        super(HtmlTabsFormElementIcon.IMAGE_URL);
        this._htmlElementModel = htmlElementModel;
        this._topic = topic;
        this._readOnly = readOnly;
    
        const image = this.getImage();
        image.addEvent('click', () => { 
          this.remove();
        });
      }

      remove() {
        if(this._readOnly) {
          const actionDispatcher = ActionDispatcher.getInstance();
          const featureId = this._htmlElementModel.getId();
          const topicId = this._topic.getId();
          actionDispatcher.removeFeatureFromTopic(topicId, featureId);
        }
      }
    
      getModel(): FeatureModel {
        return this._htmlElementModel;
      }

      getControlModel(): ControlModel {
        throw new Error('Method not implemented.');
      }

      getLayoutModel(): LayoutModel {
        throw new Error('Method not implemented.');
      }
  
    static IMAGE_URL = HtmlTabsFormImage;
  }
  
  export default HtmlTabsFormElementIcon;