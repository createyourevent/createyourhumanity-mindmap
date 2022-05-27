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
import ControlModel from '../ControlModel';

class KeywordsModel extends ControlModel {
  constructor(attributes) {
    super('keywords');
    const keywordsText = attributes.text ? attributes.text : ' ';
    this.setText(keywordsText);
    const keyText = attributes.key ? attributes.key : ' ';
    this.setKey(keyText);
    const requiredText = attributes.required ? attributes.required : false;
    this.setRequired(requiredText);
  }

  /** */
  getText(): string {
    return this.getAttribute('text') as string;
  }

  /** */
  setText(text: string) {
    $assert(text, 'text can not be null');
    this.setAttribute('text', text);
  }

  getKey(): string {
    return this.getAttribute('key') as string;
  }

  setKey(key: string) {
    //$assert(key, 'key can not be null');
    this.setAttribute('key', key);
  }

  getRequired(): boolean {
    return this.getAttribute('required') as boolean;
  }

  setRequired(required: boolean) {
    ///$assert(required, 'required can not be null');
    this.setAttribute('required', required);
  }
}

export default KeywordsModel;
