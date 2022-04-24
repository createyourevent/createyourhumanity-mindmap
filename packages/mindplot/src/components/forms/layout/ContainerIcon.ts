import ContainerImage from '../../../../assets/icons/html/layout/container.png';
import Icon from '../../Icon';
import Topic from '../../Topic';
import { $assert } from '@wisemapping/core-js';
import ContainerModel from '../../model/layout/ContainerModel';
import LayoutModel from '../../model/LayoutModel';
import FeatureModel from '../../model/FeatureModel';
import ActionDispatcher from '../../ActionDispatcher';
import FloatingTip from '../../widget/FloatingTip';
import TopicControlFactory from '../../ControlFeature';
import { $msg } from '../../Messages';
import ControlModel from '../../model/ControlModel';

class ContainerIcon extends Icon {

    private _containerModel: LayoutModel;

    private _topic: Topic;
  
    private _readOnly: boolean;

    private _tip: FloatingTip;
    
    constructor(topic: Topic, containerModel: ContainerModel, readOnly: boolean) {
        $assert(topic, 'topic can not be null');
        $assert(containerModel, 'containerModel can not be null');
    
        super(ContainerIcon.IMAGE_URL);
        this._containerModel = containerModel;
        this._topic = topic;
        this._readOnly = readOnly;

        const image = this.getImage();
        this._registerEvents();
    }

    private _registerEvents(): void {
      this._image.setCursor('pointer');
      const me = this;
  
      if (!this._readOnly) {
        // Add on click event to open the editor ...
        this.addEvent('click', (event) => {
          //me._topic.showPropertiesEditor(TopicControlFactory.Textfield.id);
          me.remove();
          event.stopPropagation();
        });
      }
      /*
      this._tip = new FloatingTip($(me.getImage().peer._native), {
        title: $msg('PROPERTIES'),
        // Content can also be a function of the target element!
        content() {
          return me._buildTooltipContent();
        },
        html: true,
        placement: 'bottom',
        destroyOnExit: true,
      });
      */
    }

    
    _buildTooltipContent() {
      if ($('body').find('#popoverProperties').length === 1) {
        const text = $('body').find('#popoverProperties');
        text.text(this._containerModel.getKey());
        return text;
      }
      const result = $('<div id="popoverProperties"></div>').css({ padding: '5px', width: '250px' });

      return result;
    }


    remove() {
        const actionDispatcher = ActionDispatcher.getInstance();
        const controlId = this._containerModel.getId();
        const topicId = this._topic.getId();
        actionDispatcher.removeLayoutFromTopic(topicId, controlId);
      }

    getModel(): FeatureModel {
        throw new Error('Method not implemented.');
    }

    getControlModel(): ControlModel {
      throw new Error('Method not implemented.');
      }

    getLayoutModel(): LayoutModel {
        return this._containerModel;
    }

    

    static IMAGE_URL = ContainerImage;
  }
  
  export default ContainerIcon;