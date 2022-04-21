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

const images = importAll(require.context('../../assets/icons', false, /\.(png|svg)$/));

class ImageIcon extends Icon {
  constructor(topic, iconModel, readOnly) {
    $assert(iconModel, 'iconModel can not be null');
    $assert(topic, 'topic can not be null');

    // Build graph image representation ...
    const iconType = iconModel.getIconType();
    const imgUrl = ImageIcon.getImageUrl(iconType);
    super(imgUrl);

    this._topicId = topic.getId();
    this._featureModel = iconModel;

    if (!readOnly) {
      // Icon
      const image = this.getImage();
      const me = this;
      image.addEvent('click', () => {
        const iconTypeClick = iconModel.getIconType();
        const newIconType = ImageIcon._getNextFamilyIconId(iconTypeClick);
        iconModel.setIconType(newIconType);

        me._image.setHref(ImageIcon.getImageUrl(newIconType));
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

  getControlModel() {
    throw new Error('Method not implemented.');
  }

  static _getNextFamilyIconId(iconId) {
    const familyIcons = ImageIcon._getFamilyIcons(iconId);
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
    for (let i = 0; i < ImageIcon.prototype.ICON_FAMILIES.length; i++) {
      const family = ImageIcon.prototype.ICON_FAMILIES[i];
      const iconFamilyId = iconId.substr(0, iconId.indexOf('_'));

      if (family.id === iconFamilyId) {
        result = family.icons;
        break;
      }
    }
    return result;
  }

  remove() {
    const actionDispatcher = ActionDispatcher.getInstance();
    const featureId = this._featureModel.getId();
    const topicId = this._topicId;
    actionDispatcher.removeFeatureFromTopic(topicId, featureId);
  }
}

ImageIcon.prototype.ICON_FAMILIES = [{
  id: 'face',
  icons: ['face_plain', 'face_sad', 'face_crying', 'face_smile', 'face_surprise', 'face_wink'],
},
{
  id: 'funy',
  icons: ['funy_angel', 'funy_devilish', 'funy_glasses', 'funy_grin', 'funy_kiss', 'funy_monkey'],
},
{
  id: 'sport',
  icons: ['sport_basketball', 'sport_football', 'sport_golf', 'sport_raquet', 'sport_shuttlecock', 'sport_soccer', 'sport_tennis'],
},
{
  id: 'bulb',
  icons: ['bulb_light_on', 'bulb_light_off'],
},
{
  id: 'thumb',
  icons: ['thumb_thumb_up', 'thumb_thumb_down'],
},
{
  id: 'tick',
  icons: ['tick_tick', 'tick_cross'],
},
{
  id: 'onoff',
  icons: ['onoff_clock', 'onoff_clock_red', 'onoff_add', 'onoff_delete', 'onoff_status_offline', 'onoff_status_online'],
},
{
  id: 'money',
  icons: ['money_money', 'money_dollar', 'money_euro', 'money_pound', 'money_yen', 'money_coins', 'money_ruby'],
},
{
  id: 'time',
  icons: ['time_calendar', 'time_clock', 'time_hourglass'],
},
{
  id: 'number',
  icons: ['number_1', 'number_2', 'number_3', 'number_4', 'number_5', 'number_6', 'number_7', 'number_8', 'number_9'],
},
{
  id: 'chart',
  icons: ['chart_bar', 'chart_line', 'chart_curve', 'chart_pie', 'chart_organisation'],
},
{
  id: 'sign',
  icons: ['sign_warning', 'sign_info', 'sign_stop', 'sign_help', 'sign_cancel'],
},
{
  id: 'hard',
  icons: ['hard_cd', 'hard_computer', 'hard_controller', 'hard_driver_disk', 'hard_ipod', 'hard_keyboard', 'hard_mouse', 'hard_printer', 'hard_webcam', 'hard_microphone'],
},
{
  id: 'things',
  icons: ['things_address_book', 'things_wrench', 'things_pin', 'things_window-layout', 'things_bubbles'],
},
{
  id: 'soft',
  icons: ['soft_bug', 'soft_cursor', 'soft_database_table', 'soft_database', 'soft_feed', 'soft_folder_explore', 'soft_rss', 'soft_penguin'],
},
{
  id: 'arrow',
  icons: ['arrow_up', 'arrow_down', 'arrow_left', 'arrow_right'],
},
{
  id: 'arrowc',
  icons: ['arrowc_rotate_anticlockwise', 'arrowc_rotate_clockwise', 'arrowc_turn_left', 'arrowc_turn_right'],
},
{
  id: 'people',
  icons: ['people_group', 'people_male1', 'people_male2', 'people_female1', 'people_female2'],
},
{
  id: 'mail',
  icons: ['mail_envelop', 'mail_mailbox', 'mail_edit', 'mail_list'],
},
{
  id: 'flag',
  icons: ['flag_blue', 'flag_green', 'flag_orange', 'flag_pink', 'flag_purple', 'flag_yellow'],
},
{
  id: 'social',
  icons: ['social_facebook', 'social_twitter', 'social_redit', 'social_instagram', 'social_google-plus'],
},
{
  id: 'meetapps',
  icons: ['meetapps_slack', 'meetapps_google-meet', 'meetapps_whatapp', 'meetapps_ms-teams', 'meetapps_zoom', 'meeetapps_facebook-messenger'],
},
{
  id: 'appsgoogle',
  icons: ['appsgoogle_youtube', 'appsgoogle_gmail', 'appsgoogle_maps'],
},
{
  id: 'tag',
  icons: ['tag_blue', 'tag_green', 'tag_orange', 'tag_red', 'tag_pink', 'tag_yellow'],
},
{
  id: 'object',
  icons: ['object_bell', 'object_clanbomber', 'object_key', 'object_pencil', 'object_phone', 'object_magnifier', 'object_clip',
    'object_music', 'object_star', 'object_wizard', 'object_house', 'object_cake', 'object_camera', 'object_palette', 'object_rainbow',
  ],
},
{
  id: 'weather',
  icons: ['weather_clear-night', 'weather_clear', 'weather_few-clouds-night', 'weather_few-clouds', 'weather_overcast', 'weather_severe-alert', 'weather_showers-scattered', 'weather_showers', 'weather_snow', 'weather_storm'],
},
{
  id: 'task',
  icons: ['task_0', 'task_25', 'task_50', 'task_75', 'task_100'],
},
];

export default ImageIcon;
