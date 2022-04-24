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

import HtmlLayoutContainer from '../../../assets/images/html/layout/container.png';
import HtmlLayoutRow from '../../../assets/images/html/layout/row.png';
import HtmlLayoutColumn from '../../../assets/images/html/layout/column.png';
import HtmlLayoutTitle from '../../../assets/images/html/layout/title.png';
import HtmlLayoutHr from '../../../assets/images/html/layout/hr.png';


class TopicHtmlLayoutPanel extends ListToolbarPanel {
  // eslint-disable-next-line class-methods-use-this
  buildPanel() {
    const content = $("<div class='toolbarPanel' id='topicHtmlLayout'></div>");
    content[0].innerHTML = `
      <div id="container"><img src="${HtmlLayoutContainer}" alt="Container">Container</div>
      <div id="row"><img src="${HtmlLayoutRow}" alt="Row">Row</div>
      <div id="column"><img src="${HtmlLayoutColumn}" alt="Column">Column</div>
      <hr/>
      <div id="title"><img src="${HtmlLayoutTitle}" alt="Title">Title</div>
      <hr/>
      <div id="hr"><img src="${HtmlLayoutHr}" alt="hr">hr</div>`
    return content;
  }
}

export default TopicHtmlLayoutPanel;