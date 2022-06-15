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
import ControlType from './ControlType';

class ControlModel {
  static _nextId = 0;

  private _id: string;

  private _type: ControlType;

  private _attributes;

  private _required: boolean;

  private _key: string;

  private _description: string;

  /**
     * @constructs
     * @param type
     * @throws will throw an exception if type is null or undefined
     * assigns a unique id and the given type to the new model
     */
  constructor(type: ControlType) {
    $assert(type, 'type can not be null');
    this._id = "" + ControlModel._nextUUID();

    this._type = type;
    this._attributes = {};

    // Create type method ...
    this[`is${ControlModel.capitalize(type)}Model`] = () => true;
  }

  getAttributes() {
    return { ...this._attributes };
  }

  static capitalize(str: string) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  setAttributes(attributes) {
    Object.keys(attributes).forEach((attr) => {
      const funName = `set${ControlModel.capitalize(attr)}`;
      const value = attributes[attr];
      this[funName](value);
    });
  }

  setAttribute(key: string, value: unknown) {
    $assert(key, 'key id can not be null');
    this._attributes[key] = value;
  }

  getAttribute(key: string) {
    $assert(key, 'key id can not be null');

    return this._attributes[key];
  }

  getId(): string {
    return this._id;
  }


  
  setId(id: string) {
    this._id = id;
  }

  getType(): ControlType {
    return this._type;
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

  getDescription(): string {
    return this.getAttribute('description') as string;
  }

  setDescription(desc: string) {
    this.setAttribute('description', desc);
  }

  static _nextUUID(): number {
    const result = ControlModel._nextId + 1;
    ControlModel._nextId = result;
    return result;
  }
}

export default ControlModel;
