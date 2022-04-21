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
import { $assert } from '@wisemapping/core-js';
import $ from 'jquery';
import BootstrapDialog from '../../../../editor/src/classes/bootstrap/BootstrapDialog';
import { $msg } from '../Messages';

class NoteEditor extends BootstrapDialog {
  constructor(model) {
    $assert(model, 'model can not be null');
    super($msg('NOTE'), {
      cancelButton: true,
      closeButton: true,
      acceptButton: true,
      removeButton: typeof model.getValue() !== 'undefined',
      onEventData: { model },
    });
    this._model = model;
    this.css({ margin: '150px auto' });
    const panel = this._buildPanel(model);
    this.setContent(panel);
  }

  _buildPanel(model) {
    const result = $('<div></div>').css('padding-top', '5px');

    const form = $('<form></form>').attr({
      action: 'none',
      id: 'noteFormId',
    });

    // Add textarea
    const textArea = $('<textarea></textarea autofocus>').attr({
      placeholder: $msg('WRITE_YOUR_TEXT_HERE'),
      required: 'true',
      class: 'form-control',
    });
    textArea.css({
      width: '100%',
      height: 80,
      resize: 'none',
    });
    textArea.on('keypress', (event) => {
      event.stopPropagation();
    });
    form.append(textArea);

    if (model.getValue() != null) {
      textArea.val(model.getValue());
    }

    result.append(form);
    return result;
  }

  onAcceptClick(event) {
    event.data.dialog._submitForm(event.data.model);
  }

  _submitForm(model) {
    const textarea = this._native.find('textarea');
    if (textarea.val()) {
      model.setValue(textarea.val());
    }
    this.close();
  }

  onDialogShown() {
    $(this).find('textarea').focus();
  }

  onRemoveClick(event) {
    event.data.model.setValue(null);
    event.data.dialog.close();
  }
}

export default NoteEditor;
