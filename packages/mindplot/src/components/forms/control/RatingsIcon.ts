import RatingsImage from '../../../../assets/icons/html/control/ratings.png';
import Icon from '../../Icon';
import Topic from '../../Topic';
import { $assert } from '@wisemapping/core-js';
import ControlModel from '../../model/ControlModel';
import FeatureModel from '../../model/FeatureModel';
import RatingsModel from '../../model/control/RatingsModel';
import ActionDispatcher from '../../ActionDispatcher';
import { $msg } from '../../Messages';
import FloatingTip from '../../widget/FloatingTip';
import LayoutModel from '../../model/LayoutModel';
import Stars from '@mat3e-ux/stars/component';
import LinkModel from '../../link/model/LinkModel';
import GoToLinkModel from '../../link/model/LinkModel';
Stars.register('m5-stars');

class RatingsIcon extends Icon {

    private _ratingsModel: ControlModel;

    private _topic: Topic;
  
    private _readOnly: boolean;
    
    private _isProfile: boolean;

    private _tip: FloatingTip;
    
    private _linkModel: GoToLinkModel;
    
    constructor(topic: Topic, ratingsModel: RatingsModel, readOnly: boolean, isProfile?: boolean) {
        $assert(topic, 'topic can not be null');
        $assert(ratingsModel, 'ratingsModel can not be null');
    
        super(RatingsIcon.IMAGE_URL);
        this._ratingsModel = ratingsModel;
        this._topic = topic;
        this._readOnly = readOnly;
        this._isProfile = isProfile;
    
        const image = this.getImage();
        this._registerEvents();
    }

    private _registerEvents(): void {
      this._image.setCursor('pointer');
      const me = this;
  
      if (this._isProfile === false || !this._readOnly) {
        // Add on click event to open the editor ...
        this.addEvent('click', (event) => {
          me._topic.showPropertiesEditor();
          event.stopPropagation();
        });
      }

      let title: string;
      if(this._isProfile) {
        title = $msg('VALUES');
      } else {
        title = $msg('PROPERTIES');
      }

      this._tip = new FloatingTip($(me.getImage().peer._native), {
        title: title,
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
      let result;
      if(!this._isProfile) {
        if ($('body').find('#popoverProperties').length === 1) {
          const text = $('body').find('#popoverProperties');
          text.text(this._ratingsModel.getKey());
          return text;
        }
        result = $('<div id="popoverProperties"></div>').css({ padding: '5px', width: '250px' });


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
        const req_value = $('<div class="col-md-6"></div>').text(this._ratingsModel.getRequired())
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
        const key_value = $('<div class="col-md-6"></div>').text(this._ratingsModel.getKey())
        .css({
          'white-space': 'pre-wrap',
          'word-wrap': 'break-word',
        });

        // key.append(key_label);
        // key.append(key_value);
        // result.append(key);

        const desc = $('<div class="row"></div>')
        .css({
          'white-space': 'pre-wrap',
          'word-wrap': 'break-word',
        });
        const desc_label = $('<div class="col-md-6"></div>').text($msg('DESC'))
        .css({
          'white-space': 'pre-wrap',
          'word-wrap': 'break-word',
        });
        const desc_value = $('<div class="col-md-6"></div>').text(this._ratingsModel.getDescription())
        .css({
          'white-space': 'pre-wrap',
          'word-wrap': 'break-word',
        });

        desc.append(desc_label);
        desc.append(desc_value);
        result.append(desc);
      } else {

        if ($('body').find('#popoverProperties').length === 1) {
          const text = $('body').find('#popoverProperties');
          text.text(this._ratingsModel.getKey());
          return text;
        }
        result = $('<div id="popoverProperties"></div>').css({ padding: '5px', width: '250px' });

        let textfield_val
        let val = this._topic.getValue();
        let gra = this._topic.getGrant();
        const isFriend = this._topic.isFriend();

        if(val === '' || val === undefined) {
          val = null;
        }
        if(gra === '' || gra === undefined) {
          gra = null;
        }

        const tag = '<m5-stars max="10" current="' + val + '"></m5-stars>';
        if((val === null && gra === null) || (val === null && gra !== null)) {
          textfield_val = $('<div class="col-md-12"></div>').text($msg('NOT_FILLED'));
        } else if (gra === 'NONE' || (!isFriend && gra === 'FRIENDS')) {
          textfield_val = $('<div class="col-md-12"></div>').text($msg('NOT_VISIBLE'));
        } else if(isFriend && gra === 'FRIENDS') {
          textfield_val = $(tag);
        } else if(gra === 'ALL' || (val !== null && gra === null)) {
          textfield_val = $(tag);
        }
        result.append(textfield_val);
      }
      return result;
    }


    remove() {
        const actionDispatcher = ActionDispatcher.getInstance();
        const controlId = this._ratingsModel.getId();
        const topicId = this._topic.getId();
        actionDispatcher.removeGoToLinkFromTopic(topicId, controlId);
        actionDispatcher.removeControlFromTopic(topicId, controlId);
      }

    getModel(): FeatureModel {
        throw new Error('Method not implemented.');
    }

    getControlModel(): ControlModel {
        return this._ratingsModel;
    }

    getLayoutModel(): LayoutModel {
      throw new Error('Method not implemented.');
    }

    getGoToLinkModel(): GoToLinkModel {
      return this._linkModel;
    }

    static IMAGE_URL = RatingsImage;
  }
  
  export default RatingsIcon;