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
import { $assert } from '@wisemapping/core-js';
import { $msg } from '../Messages';
import BootstrapDialog from './bootstrap/BootstrapDialog';

class LinkEditor extends BootstrapDialog {
  /**
     * @constructs
     * @param model
     * @throws will throw an error if model is null or undefined
     * @extends BootstrapDialog
     */
  constructor(model) {
    $assert(model, 'model can not be null');
    super($msg('LINK'), {
      cancelButton: true,
      closeButton: true,
      acceptButton: true,
      removeButton: typeof model.getValue() !== 'undefined',
      errorMessage: true,
      onEventData: { model },
    });
    this._model = model;
    this.css({ margin: '150px auto' });
    const panel = this._buildPanel(model);
    this.setContent(panel);
  }

  _buildPanel(model) {
    const result = $('<div></div>').css('padding-top', '5px');
    this.form = $('<form></form>').attr({
      action: 'none',
      id: 'linkFormId',
    });
    const text = $('<p></p>').text($msg('PASTE_URL_HERE'));
    text.css('margin', '0px 0px 20px');

    this.form.append(text);

    const section = $('<div></div>').attr({
      class: 'input-group',
    });

    // Add Input
    const input = $('<input id="inputUrl"/>').attr({
      placeholder: 'https://www.example.com/',
      required: 'true',
      autofocus: 'autofocus',
      class: 'form-control',
    });
    input.on('keypress', (event) => {
      event.stopPropagation();
    });

    if (model.getValue() != null) {
      input.val(model.getValue());
    }

    // Open Button
    const openButton = $('<button></button>').attr({
      type: 'button',
      class: 'btn btn-default',
    });

    openButton.html($msg('OPEN_LINK')).css('margin-left', '0px');
    openButton.click(() => {
      window.open(input.val(), '_blank', 'status=1,width=700,height=450,resize=1');
    });
    const spanControl = $('<span class="input-group-btn"></span>').append(openButton);

    section.append(input);
    section.append(spanControl);
    this.form.append(section);

    const me = this;
    this.form.unbind('submit').submit((event) => {
      event.preventDefault();
      let inputValue = input.val();
      inputValue = this.hasProtocol(inputValue) ? inputValue : `https://${inputValue}`;
      if (me.checkURL(inputValue)) {
        me.cleanError();
        if (inputValue != null && $.trim(inputValue) !== '') {
          model.setValue(inputValue);
        }
        me.close();
        this.formSubmitted = true;
      } else {
        me.alertError($msg('URL_ERROR'));
        event.stopPropagation();
      }
    });

    result.append(this.form);
    return result;
  }

  /**
   * checks whether the input is a valid url
   * @return {Boolean} true if the url is valid
   */
  checkURL(url) {
    const regex = /^(http|https):\/\/[a-z0-9]+([-.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$/i;
    return (regex.test(url));
  }

  /**
   * checks whether the input is a valid url
   * @return {Boolean} true if the url is valid
   */
  hasProtocol(url) {
    const regex = /^(http|https):\/\//i;
    return (regex.test(url));
  }

  /**
   * overrides abstract parent method
   * triggered when the user clicks the accept button - submits the url input
   * @param event
   */
  onAcceptClick(event) {
    this.formSubmitted = false;
    $('#linkFormId').trigger('submit');
    if (!this.formSubmitted) {
      event.stopPropagation();
    }
  }

  /**
   * overrides parent method
   * sets the url input on focus
   */
  onDialogShown() {
    $(this).find('#inputUrl').focus();
  }

  /**
   * overrides abstract parent method
   * triggered when the user clicks the remove button - deletes the link
   */
  onRemoveClick(event) {
    event.data.model.setValue(null);
    event.data.dialog.close();
  }
}

export default LinkEditor;
