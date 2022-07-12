import HtmlMultistepFormImage from '../../../assets/icons/html/multistep-form.png';
import Icon from '../Icon';
import FeatureModel from '../model/FeatureModel';
import Topic from '../Topic';
import { $assert } from '@wisemapping/core-js';
import ControlModel from '../model/ControlModel';
import ActionDispatcher from '../ActionDispatcher';
import HtmlFormModel from '../model/form/HtmlFormModel';
import LayoutModel from '../model/LayoutModel';
import LinkModel from '../link/model/LinkModel';

class HtmlMultistepFormElementIcon extends Icon {

    private _htmlElementModel: FeatureModel;

    private _topic: Topic;
  
    private _readOnly: boolean;
    
    constructor(topic: Topic, htmlElementModel: HtmlFormModel, readOnly: boolean) {
        $assert(topic, 'topic can not be null');
        $assert(htmlElementModel, 'linkModel can not be null');
    
        super(HtmlMultistepFormElementIcon.IMAGE_URL);
        this._htmlElementModel = htmlElementModel;
        this._topic = topic;
        this._readOnly = readOnly;
        this._topic.adjustShapes();
        
        const image = this.getImage();
        image.addEvent('click', () => {
          this.remove();
        });
      }

      remove() {
        //if(!this._readOnly) {
          const actionDispatcher = ActionDispatcher.getInstance();
          const featureId = this._htmlElementModel.getId();
          const topicId = this._topic.getId();
          actionDispatcher.removeFeatureFromTopic(topicId, featureId);
        //}
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

      getGoToLinkModel(): LinkModel {
        throw new Error('Method not implemented.');
      }
  
    static IMAGE_URL = HtmlMultistepFormImage;
  }
  
  export default HtmlMultistepFormElementIcon;