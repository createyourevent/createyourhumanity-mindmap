import AddressImage from '../../../../assets/icons/html/control/address.png';
import Icon from '../../Icon';
import Topic from '../../Topic';
import { $assert } from '@wisemapping/core-js';
import AddressModel from '../../model/control/AddressModel';
import ControlModel from '../../model/ControlModel';
import FeatureModel from '../../model/FeatureModel';
import ActionDispatcher from '../../ActionDispatcher';
import FloatingTip from '../../widget/FloatingTip';
import TopicControlFactory from '../../ControlFeature';
import { $msg } from '../../Messages';
import LayoutModel from '../../model/LayoutModel';

class AddressIcon extends Icon {

    private _addressModel: ControlModel;

    private _topic: Topic;
  
    private _readOnly: boolean;

    private _tip: FloatingTip;
    
    constructor(topic: Topic, addressModel: AddressModel, readOnly: boolean) {
        $assert(topic, 'topic can not be null');
        $assert(addressModel, 'addressModel can not be null');
    
        super(AddressIcon.IMAGE_URL);
        this._addressModel = addressModel;
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
          me._topic.showPropertiesEditor(TopicControlFactory.Textfield.id);
          event.stopPropagation();
        });
      }

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
    }


    _buildTooltipContent() {
      if ($('body').find('#popoverProperties').length === 1) {
        const text = $('body').find('#popoverProperties');
        text.text(this._addressModel.getKey());
        return text;
      }
      const result = $('<div id="popoverProperties"></div>').css({ padding: '5px', width: '250px' });


      const req = $('<div class="row"></div>')
      .css({
        'white-space': 'pre-wrap',
        'word-wrap': 'break-word',
      });
      const req_label = $('<div class="col-md-6"></div>').text($msg('REQUIRED'))
      .css({
        'white-space': 'pre-wrap',
        'word-wrap': 'break-word',
      });
      const req_value = $('<div class="col-md-6"></div>').text(this._addressModel.getRequired())
      .css({
        'white-space': 'pre-wrap',
        'word-wrap': 'break-word',
      });

      req.append(req_label);
      req.append(req_value);
      result.append(req);

      const key = $('<div class="row"></div>')
      .css({
        'white-space': 'pre-wrap',
        'word-wrap': 'break-word',
      });
      const key_label = $('<div class="col-md-6"></div>').text($msg('KEY'))
      .css({
        'white-space': 'pre-wrap',
        'word-wrap': 'break-word',
      });
      const key_value = $('<div class="col-md-6"></div>').text(this._addressModel.getKey())
      .css({
        'white-space': 'pre-wrap',
        'word-wrap': 'break-word',
      });

      key.append(key_label);
      key.append(key_value);
      result.append(key);

      return result;
    }


    remove() {
        const actionDispatcher = ActionDispatcher.getInstance();
        const controlId = this._addressModel.getId();
        const topicId = this._topic.getId();
        actionDispatcher.removeControlFromTopic(topicId, controlId);
      }

    getModel(): FeatureModel {
        throw new Error('Method not implemented.');
    }

    getControlModel(): ControlModel {
        return this._addressModel;
    }

    getLayoutModel(): LayoutModel {
      throw new Error('Method not implemented.');
    }

    static IMAGE_URL = AddressImage;
  }
  
  export default AddressIcon;