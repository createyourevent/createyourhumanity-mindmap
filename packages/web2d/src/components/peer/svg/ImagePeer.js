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
import ElementPeer from './ElementPeer';

class ImagePeer extends ElementPeer {
  constructor() {
    const svgElement = window.document.createElementNS(ElementPeer.svgNamespace, 'image');
    super(svgElement);
    this._position = { x: 0, y: 0 };
    this._href = '';
    this._native.setAttribute('preserveAspectRatio', 'none');
  }

  setPosition(x, y) {
    this._position = { x, y };
    this._native.setAttribute('y', y);
    this._native.setAttribute('x', x);
  }

  getPosition() {
    return this._position;
  }

  setHref(url) {
    this._native.setAttributeNS(ElementPeer.linkNamespace, 'href', url);
    this._href = url;
  }

  getHref() {
    return this._href;
  }
}

export default ImagePeer;
