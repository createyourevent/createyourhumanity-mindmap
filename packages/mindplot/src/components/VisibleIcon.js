/*
 *    Copyright [2021] [wisemapping]
 *
 *   Licensed under WiseMapping Public License, Version 1.0 (the "License").
 *   It is basically the Apache License, Version 2.0 (the "License") plus the
 *   "powered by wisemapping" text requirement on every single page;
 *   you may not use this file except in compliance with the License.
 *   You may obtain a copy of the license at
 *
 *       http://www.wisemapping.org/license
 *
 *   Unless required by applicable law or agreed to in writing, software
 *   distributed under the License is distributed on an "AS IS" BASIS,
 *   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *   See the License for the specific language governing permissions and
 *   limitations under the License.
 */
import {
  $assert,
} from '@wisemapping/core-js';
import Icon from './Icon';
import ActionDispatcher from './ActionDispatcher';

function importAll(r) {
  const images = {};
  r.keys().forEach((item) => {
    images[item.replace('./', '')] = r(item);
  });
  return images;
}

const images = importAll(require.context('../../assets/icons/visible', false, /\.(png|svg)$/));

class VisibleIcon extends Icon {
  constructor(topic, iconModel, readOnly) {
    $assert(iconModel, 'iconModel can not be null');
    $assert(topic, 'topic can not be null');

    // Build graph image representation ...
    const iconType = iconModel.getIconType();
    const imgUrl = VisibleIcon.getImageUrl(iconType);
    super(imgUrl);

    this._topicId = topic.getId();
    this._featureModel = iconModel; 

    if (!readOnly) {
      // Icon
      const image = this.getImage();
      const me = this;
      image.addEvent('click', () => {
        const iconTypeClick = iconModel.getIconType();
        const newIconType = VisibleIcon._getNextFamilyIconId(iconTypeClick);
        iconModel.setIconType(newIconType);
        me._image.setHref(VisibleIcon.getImageUrl(newIconType));
        let evt = new CustomEvent('VisibleData', { detail: { topic: this._topicId, iconType: newIconType  }});
        topic.adjustShapes();
        window.dispatchEvent(evt);
      });
      this._image.setCursor('pointer');
    }
  }

  static getImageUrl(iconId) {
    let result = images[`${iconId}.svg`];
    if (!result) {
      result = images[`${iconId}.png`];
    }
    return result;
  }

  getModel() {
    return this._featureModel;
  }

  static _getNextFamilyIconId(iconId) {
    const familyIcons = VisibleIcon._getFamilyIcons(iconId);
    $assert(familyIcons !== null, `Family Icon not found: ${iconId}`);

    let result = null;
    for (let i = 0; i < familyIcons.length && result == null; i++) {
      if (familyIcons[i] === iconId) {
        // Is last one?
        if (i === (familyIcons.length - 1)) {
          [result] = familyIcons;
        } else {
          result = familyIcons[i + 1];
        }
        break;
      }
    }

    return result;
  }

  static _getFamilyIcons(iconId) {
    $assert(iconId != null, 'id must not be null');
    $assert(iconId.indexOf('_') !== -1, `Invalid icon id (it must contain '_'). Id: ${iconId}`);

    let result = null;
    for (let i = 0; i < VisibleIcon.prototype.ICON_FAMILIES.length; i++) {
      const family = VisibleIcon.prototype.ICON_FAMILIES[i];
      const iconFamilyId = iconId.substr(0, iconId.indexOf('_'));

      if (family.id === iconFamilyId) {
        result = family.icons;
        break;
      }
    }
    return result;
  }
/*
  remove() {
    const actionDispatcher = ActionDispatcher.getInstance();
    const featureId = this._featureModel.getId();
    const topicId = this._topicId;
    actionDispatcher.removeFeatureFromTopic(topicId, featureId);
  }
  */
}

VisibleIcon.prototype.ICON_FAMILIES = [{
  id: 'visible',
  icons: ['visible_visible', 'visible_not-visible'],
},
];

export default VisibleIcon;
