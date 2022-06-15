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
import $ from 'jquery';
import ListToolbarPanel from './ListToolbarPanel';

import HtmlControlTextfield from '../../../assets/images/html/control/textfield.png';
import HtmlControlTextarea from '../../../assets/images/html/control/textarea.png';
import HtmlControlSelect from '../../../assets/images/html/control/selectbox.png';
import HtmlControlRadio from '../../../assets/images/html/control/radio.png';
import HtmlControlCheckbox from '../../../assets/images/html/control/checkbox.png';
import HtmlControlOption from '../../../assets/images/html/control/option.png';
import HtmlControlRadioGroup from '../../../assets/images/html/control/radiogroup.png';
import HtmlControlCalendar from '../../../assets/images/html/control/calendar.png';

import HtmlControlTime from '../../../assets/images/html/control/time.png';
import HtmlControlAddress from '../../../assets/images/html/control/address.png';
import HtmlControlEditor from '../../../assets/images/html/control/editor.png';
import HtmlControlKeywords from '../../../assets/images/html/control/keywords.png';
import HtmlControlRatings from '../../../assets/images/html/control/ratings.png';

import HtmlControlMultiSelect from '../../../assets/images/html/control/multiselect.png';
import HtmlControlMultiCheckbox from '../../../assets/images/html/control/multicheckbox.png';


class TopicHtmlControlPanel extends ListToolbarPanel {
  // eslint-disable-next-line class-methods-use-this
  buildPanel() {
    const content = $("<div class='toolbarPanel' id='topicHtmlPanel'></div>");
    content[0].innerHTML = `
      <div id="textfield"><img src="${HtmlControlTextfield}" alt="Textfield">Textfield</div>
      <div id="textarea"><img src="${HtmlControlTextarea}" alt="Textare">Textarea</div>
      <div id="editor"><img src="${HtmlControlEditor}" alt="Editor">Editor</div>
      <hr/>
      <div id="select"><img src="${HtmlControlSelect}" alt="Select">Select</div>
      <div id="multiselect"><img src="${HtmlControlMultiSelect}" alt="Multiselect">Multiselect</div>
      <div id="option"><img src="${HtmlControlOption}" alt="Option">Option</div>
      <hr/>
      <div id="radiogroup"><img src="${HtmlControlRadioGroup}" alt="Radio group">Radio group</div>
      <div id="radio"><img src="${HtmlControlRadio}" alt="Radiobutton">Radiobutton</div>
      <hr/>
      <div id="checkbox"><img src="${HtmlControlCheckbox}" alt="Checkbox">Checkbox</div>
      <div id="multicheckbox"><img src="${HtmlControlMultiCheckbox}" alt="Multicheckbox">Multicheckbox</div>
      <hr/>
      <div id="calendar"><img src="${HtmlControlCalendar}" alt="Calendar">Calendar</div>
      <div id="time"><img src="${HtmlControlTime}" alt="Time">Time</div>
      <div id="address"><img src="${HtmlControlAddress}" alt="Address">Address</div>
      <div id="keywords"><img src="${HtmlControlKeywords}" alt="Keywords">Keywords</div>
      <div id="ratings"><img src="${HtmlControlRatings}" alt="Ratings">Ratings</div>`

    return content;
  }
}

export default TopicHtmlControlPanel;