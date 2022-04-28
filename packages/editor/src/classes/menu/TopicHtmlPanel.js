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
import HtmlMultistepFormImage from '../../../assets/images/html/multistep-form.png';
import HtmlTabsFormImage from '../../../assets/images/html/tab-form.png';
import HtmlFormImage from '../../../assets/images/html/form.png';
import TabsPlus from '../../../assets/images/html/tabs-plus.png';
import Step from '../../../assets/images/html/step.png';

class TopicHtmlPanel extends ListToolbarPanel {
  // eslint-disable-next-line class-methods-use-this
  buildPanel() {
    const content = $("<div class='toolbarPanel' id='topicHtmlPanel'></div>");
    content[0].innerHTML = `
      <div id="tabs_form"><img src="${HtmlTabsFormImage}" alt="Tabs form">Tabs Form</div>
      <div id="tabs_plus"><img src="${TabsPlus}" alt="Tab">Tab</div>
      <hr/>
      <div id="multi_step_form"><img src="${HtmlMultistepFormImage}" alt="Multi-Step form">Multi-Step Form</div>
      <div id="step"><img src="${Step}" alt="Step">Step</div>`
    return content;
  }
}

export default TopicHtmlPanel;