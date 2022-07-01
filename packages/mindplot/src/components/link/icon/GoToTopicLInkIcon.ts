import GoToIcon from '../../../../assets/icons/goto.png';
import Icon from '../../Icon'
import Topic from '../../Topic';
import { $assert } from '@wisemapping/core-js';
import ControlModel from '../../model/ControlModel';
import FeatureModel from '../../model/FeatureModel';
import LayoutModel from '../../model/LayoutModel';
import LinkModel from '../model/LinkModel'

class GoToTopicLinkIcon extends Icon {
    private _gotoTopicLinkModel: LinkModel;

    private _topic: Topic;
    
    constructor(topic: Topic) {
        $assert(topic, 'topic can not be null');
        super(GoToTopicLinkIcon.IMAGE_URL);
        this._gotoTopicLinkModel = new LinkModel(topic);
        this._topic = topic;
    
        const image = this.getImage();
        image.addEvent('click', () => {
          let evt = new CustomEvent('LinkData', { detail: { path: this._gotoTopicLinkModel.getPath() }});
          window.dispatchEvent(evt);
        });
      }
    
      getLinkModel(): LinkModel {
        return this._gotoTopicLinkModel;
      }

      getModel(): FeatureModel {
        throw new Error('Method not implemented.');
      }
      getControlModel(): ControlModel {
        throw new Error('Method not implemented.');
      }
      getLayoutModel(): LayoutModel {
        throw new Error('Method not implemented.');
      }
  
    static IMAGE_URL = GoToIcon;
  }
  
  export default GoToTopicLinkIcon;