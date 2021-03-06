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
import * as PolyLineUtils from '../utils/PolyLineUtils';
import ElementPeer from './ElementPeer';

class PolyLinePeer extends ElementPeer {
  constructor() {
    const svgElement = window.document.createElementNS(ElementPeer.svgNamespace, 'polyline');
    super(svgElement);
    this.setFill('none');
    this.breakDistance = 10;
  }

  setFrom(x1, y1) {
    this._x1 = x1;
    this._y1 = y1;
    this._updatePath();
  }

  setTo(x2, y2) {
    this._x2 = x2;
    this._y2 = y2;
    this._updatePath();
  }

  setStrokeWidth(width) {
    this._native.setAttribute('stroke-width', width);
  }

  setColor(color) {
    this._native.setAttribute('stroke', color);
  }

  setStyle(style) {
    this._style = style;
    this._updatePath();
  }

  getStyle() {
    return this._style;
  }

  _updatePath() {
    if (this._style === 'Curved') {
      this._updateMiddleCurvePath();
    } else if (this._style === 'Straight') {
      this._updateStraightPath();
    } else {
      this._updateCurvePath();
    }
  }

  _updateStraightPath() {
    if (
      $defined(this._x1)
            && $defined(this._x2)
            && $defined(this._y1)
            && $defined(this._y2)
    ) {
      const path = PolyLineUtils.buildStraightPath.call(
        this,
        this.breakDistance,
        this._x1,
        this._y1,
        this._x2,
        this._y2,
      );
      this._native.setAttribute('points', path);
    }
  }

  _updateMiddleCurvePath() {
    const x1 = this._x1;
    const y1 = this._y1;
    const x2 = this._x2;
    const y2 = this._y2;
    if (
      $defined(x1)
            && $defined(x2)
            && $defined(y1)
            && $defined(y2)
    ) {
      const diff = x2 - x1;
      const middlex = diff / 2 + x1;
      let signx = 1;
      let signy = 1;
      if (diff < 0) {
        signx = -1;
      }
      if (y2 < y1) {
        signy = -1;
      }
      const path = `${x1}, ${y1} ${middlex - 10 * signx}, ${y1} ${middlex}, ${
        y1 + 10 * signy
      } ${middlex}, ${y2 - 10 * signy} ${middlex + 10 * signx}, ${y2} ${x2}, ${y2}`;
      this._native.setAttribute('points', path);
    }
  }

  _updateCurvePath() {
    if (
      $defined(this._x1)
            && $defined(this._x2)
            && $defined(this._y1)
            && $defined(this._y2)
    ) {
      const path = PolyLineUtils.buildCurvedPath.call(
        this,
        this.breakDistance,
        this._x1,
        this._y1,
        this._x2,
        this._y2,
      );
      this._native.setAttribute('points', path);
    }
  }
}

export default PolyLinePeer;
