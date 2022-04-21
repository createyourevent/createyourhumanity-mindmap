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
import { $defined } from '@wisemapping/core-js';
import ElementClass from './ElementClass';
import Toolkit from './Toolkit';

class Workspace extends ElementClass {
  constructor(attributes) {
    const htmlContainer = Workspace._createDivContainer();
    const peer = Toolkit.createWorkspace(htmlContainer);
    const defaultAttributes = {
      width: '200px',
      height: '200px',
      stroke: '1px solid #edf1be',
      fillColor: 'white',
      coordOrigin: '0 0',
      coordSize: '200 200',
    };
    for (const key in attributes) {
      if (Object.prototype.hasOwnProperty.call(attributes, key)) {
        defaultAttributes[key] = attributes[key];
      }
    }
    super(peer, defaultAttributes, true);
    this._htmlContainer = htmlContainer;
    this._initialize(defaultAttributes);
    htmlContainer.append(this.peer._native);
  }

  // eslint-disable-next-line class-methods-use-this
  getType() {
    return 'Workspace';
  }

  /**
     * Appends an element as a child to the object.
     */
  append(element) {
    if (!$defined(element)) {
      throw new Error('Child element can not be null');
    }
    const elementType = element.getType();
    if (elementType == null) {
      throw new Error(`It seems not to be an element ->${element}`);
    }

    if (elementType === 'Workspace') {
      throw new Error('A workspace can not have a workspace as a child');
    }

    this.peer.append(element.peer);
  }

  addItAsChildTo(element) {
    if (!$defined(element)) {
      throw new Error('Workspace div container can not be null');
    }
    element.append(this._htmlContainer);
  }

  /**
     * Create a new div element that will be responsible for containing the workspace elements.
     */
  static _createDivContainer() {
    const container = window.document.createElement('div');
    container.style.position = 'relative';
    container.style.top = '0px';
    container.style.left = '0px';
    container.style.height = '688px';
    container.style.border = '1px solid red';

    return container;
  }

  /**
     *  Set the workspace area size. It can be defined using different units:
     * in (inches; 1in=2.54cm)
     * cm (centimeters; 1cm=10mm)
     * mm (millimeters)
     * pt (points; 1pt=1/72in)
     * pc (picas; 1pc=12pt)
     */
  setSize(width, height) {
    // HTML container must have the size of the group element.
    if ($defined(width)) {
      this._htmlContainer.style.width = width;
    }

    if ($defined(height)) {
      this._htmlContainer.style.height = height;
    }
    this.peer.setSize(width, height);
  }

  /**
     * The workspace element is a containing blocks for this content
     * - they define a CSS2 "block level box".
     * Inside the containing block a local coordinate system is
     * defined for any sub-elements using the coordsize and coordorigin attributes.
     * All CSS2 positioning information is expressed in terms of this local coordinate space.
     * Consequently CSS2 position attributes (left, top, width, height
     * and so on) have no unit specifier -
     * they are simple numbers, not CSS length quantities.
     */
  setCoordSize(width, height) {
    this.peer.setCoordSize(parseInt(width, 10), parseInt(height, 10));
  }

  /**
     * @Todo: Complete Doc
     */
  setCoordOrigin(x, y) {
    this.peer.setCoordOrigin(x, y);
  }

  /**
     * @Todo: Complete Doc
     */
  getCoordOrigin() {
    return this.peer.getCoordOrigin();
  }

  // Private method declaration area
  /**
     * All the SVG elements will be children of this HTML element.
     */
  _getHtmlContainer() {
    return this._htmlContainer;
  }

  setFill(color, opacity) {
    this._htmlContainer.style.backgroundColor = color;
    if (opacity || opacity === 0) {
      throw new Error('Unsupported operation. Opacity not supported.');
    }
  }

  getFill() {
    const color = this._htmlContainer.style.backgroundColor;
    return { color };
  }

  getSize() {
    const { width, height } = this._htmlContainer.style;
    return { width, height };
  }

  setStroke(width, style, color, opacity) {
    if (style !== 'solid') {
      throw new Error(`Not supported style stroke style:${style}`);
    }
    this._htmlContainer.style.border = `${width} ${style} ${color}`;

    if (opacity || opacity === 0) {
      throw new Error('Unsupported operation. Opacity not supported.');
    }
  }

  getCoordSize() {
    return this.peer.getCoordSize();
  }

  /**
     * Remove an element as a child to the object.
     */
  removeChild(element) {
    if (!$defined(element)) {
      throw new Error('Child element can not be null');
    }

    if (element === this) {
      throw new Error("It's not possible to add the group as a child of itself");
    }

    const elementType = element.getType();
    if (elementType == null) {
      throw new Error(`It seems not to be an element ->${element}`);
    }

    this.peer.removeChild(element.peer);
  }

  getSVGElement() {
    return this._htmlContainer.firstChild;
  }
}

export default Workspace;
