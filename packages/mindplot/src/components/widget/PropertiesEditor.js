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

class PropertiesEditor extends BootstrapDialog {
  /**
     * @constructs
     * @param model
     * @throws will throw an error if model is null or undefined
     * @extends BootstrapDialog
     */
  constructor(model) {
    $assert(model, 'model can not be null');
    super($msg('PROPERTIES'), {
      cancelButton: true,
      closeButton: true,
      acceptButton: true,
      removeButton: false,
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
      id: 'propertiesFormId',
    });
    const text = $('<p></p>').text($msg('PROPERTIES_INFO'));
    text.css('margin', '0px 0px 20px');

    this.form.append(text);

    const section = $('<div></div>');

    // Add Required

    const req_label = $('<label for="req">Required</label>');
    let t = model.getRequired();
    if(t === "true") {
      t = true;
    }else if(t === "false") {
      t = false;
    }
    let required_true = $('<input id="inputReqTrue" name="req" type="radio"/>');
    const key_label_true = $('<label for="inputReqTrue">True</label>');
    if (t === true) {
      required_true = $('<input id="inputReqTrue" name="req" type="radio" checked/>')
    } 

    let required_false = $('<input id="inputReqFalse" name="req" type="radio"/>')
    if (t === false) {
      required_false = $('<input id="inputReqFalse" name="req" type="radio" checked/>')
    } 
    const key_label_false = $('<label for="inputReqFalse">False</label>');


    const div_row = $('<div class="row"></div>');
    const div_col_1 = $('<div class="col-sm-12"></div>');
    const div_col_2 = $('<div class="col-sm-12"></div>');

    div_col_1.append(required_true);
    div_col_1.append(key_label_true);
    div_row.append(div_col_1);

    div_col_2.append(required_false);
    div_col_2.append(key_label_false);
    div_row.append(div_col_2);


    // Add Input
    const key_label = $('<label for="key">Key</label>');
    const input = $('<input id="key" name="key"/>').attr({
      placeholder: 'Key...',
      required: 'true',
      autofocus: 'autofocus',
      class: 'form-control',
    });
    input.on('keypress', (event) => {
      event.stopPropagation();
    });

    if (model.getKey() != null) {
      input.val(model.getKey());
    }

    // Add Input
    const desc_label = $('<label for="description">Description</label>');
    const desc_input = $('<textarea id="description" name="description"/>').attr({
      placeholder: 'Description...',
      required: 'false',
      autofocus: 'autofocus',
      class: 'form-control',
    });
    desc_input.on('keypress', (event) => {
      event.stopPropagation();
    });

    if (model.getDescription() != null) {
      desc_input.val(model.getDescription());
    }

    const hr = $('<hr/>');

    section.append(req_label);
    section.append(div_row);
    // section.append(hr);
    // section.append(key_label);
    // section.append(input);
    section.append(hr);
    section.append(desc_label);
    section.append(desc_input);
    this.form.append(section);



    const me = this;
    this.form.unbind('submit').submit((event) => {
      event.preventDefault();
      let keyValue = input.val();
      model.setKey(keyValue);
      const radios = document. getElementsByName('req');
      const selected = Array.from(radios).find(radio => radio.checked);
      let req = false;
      if(selected.id === 'inputReqTrue') {
        req = true;
      }
      model.setRequired(req);
      let descValue = desc_input.val();
      model.setDescription(descValue);
      this.close();
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
    $('#propertiesFormId').trigger('submit');
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
}

export default PropertiesEditor;
