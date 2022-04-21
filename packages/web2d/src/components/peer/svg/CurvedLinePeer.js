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
import ElementPeer from './ElementPeer';
import Point from '../../Point';

class CurvedLinePeer extends ElementPeer {
  constructor() {
    const svgElement = window.document.createElementNS(ElementPeer.svgNamespace, 'path');
    super(svgElement);
    this._style = { fill: '#495879' };
    this._updateStyle();
    this._customControlPoint_1 = false;
    this._customControlPoint_2 = false;
    this._control1 = new Point();
    this._control2 = new Point();
    this._lineStyle = true;
  }

  setSrcControlPoint(control) {
    this._customControlPoint_1 = true;
    const change = this._control1.x !== control.x || this._control1.y !== control.y;
    if ($defined(control.x)) {
      this._control1 = control;
      this._control1.x = Number.parseFloat(this._control1.x, 10);
      this._control1.y = Number.parseFloat(this._control1.y, 10);
    }
    if (change) {
      this._updatePath();
    }
  }

  setDestControlPoint(control) {
    this._customControlPoint_2 = true;
    const change = this._control2.x !== control.x || this._control2.y !== control.y;
    if ($defined(control.x)) {
      this._control2 = control;
      this._control2.x = Number.parseFloat(this._control2.x, 10);
      this._control2.y = Number.parseFloat(this._control2.y, 10);
    }
    if (change) this._updatePath();
  }

  isSrcControlPointCustom() {
    return this._customControlPoint_1;
  }

  isDestControlPointCustom() {
    return this._customControlPoint_2;
  }

  setIsSrcControlPointCustom(isCustom) {
    this._customControlPoint_1 = isCustom;
  }

  setIsDestControlPointCustom(isCustom) {
    this._customControlPoint_2 = isCustom;
  }

  getControlPoints() {
    return [this._control1, this._control2];
  }

  setFrom(x1, y1) {
    const change = this._x1 !== Number.parseFloat(x1, 10) || this._y1 !== Number.parseFloat(y1, 10);
    this._x1 = Number.parseFloat(x1, 10);
    this._y1 = Number.parseFloat(y1, 10);
    if (change) this._updatePath();
  }

  setTo(x2, y2) {
    const change = this._x2 !== Number.parseFloat(x2, 10) || this._y2 !== parseFloat(y2, 10);
    this._x2 = Number.parseFloat(x2, 10);
    this._y2 = Number.parseFloat(y2, 10);
    if (change) this._updatePath();
  }

  getFrom() {
    return new Point(this._x1, this._y1);
  }

  getTo() {
    return new Point(this._x2, this._y2);
  }

  setStrokeWidth(width) {
    this._style['stroke-width'] = width;
    this._updateStyle();
  }

  setColor(color) {
    this._style.stroke = color;
    this._style.fill = color;
    this._updateStyle();
  }

  updateLine(avoidControlPointFix) {
    this._updatePath(avoidControlPointFix);
  }

  setLineStyle(style) {
    this._lineStyle = style;
    if (this._lineStyle) {
      this._style.fill = this._fill;
    } else {
      this._fill = this._style.fill;
      this._style.fill = 'none';
    }
    this._updateStyle();
    this.updateLine();
  }

  getLineStyle() {
    return this._lineStyle;
  }

  setShowEndArrow(visible) {
    this._showEndArrow = visible;
    this.updateLine();
  }

  isShowEndArrow() {
    return this._showEndArrow;
  }

  setShowStartArrow(visible) {
    this._showStartArrow = visible;
    this.updateLine();
  }

  isShowStartArrow() {
    return this._showStartArrow;
  }

  _updatePath(avoidControlPointFix) {
    if (
      $defined(this._x1)
      && $defined(this._y1)
      && $defined(this._x2)
      && $defined(this._y2)
    ) {
      this._calculateAutoControlPoints(avoidControlPointFix);

      const path = `M${this._x1.toFixed(2)},${this._y1.toFixed(2)} C${(this._control1.x + this._x1).toFixed(2)},${this._control1.y + this._y1
      } ${(this._control2.x + this._x2).toFixed(2)},${(this._control2.y + this._y2).toFixed(2)} ${(this._x2).toFixed(2)},${(this._y2).toFixed(2)}${this._lineStyle
        ? ` ${(this._control2.x + this._x2).toFixed(2)},${(this._control2.y + this._y2 + 3).toFixed(2)} ${(this._control1.x + this._x1
        ).toFixed(2)},${(this._control1.y + this._y1 + 5).toFixed(2)} ${this._x1.toFixed(2)},${(this._y1 + 7).toFixed(2)} Z`
        : ''
      }`;
      this._native.setAttribute('d', path);
    }
  }

  _updateStyle() {
    let style = '';
    for (const key in this._style) {
      if (Object.prototype.hasOwnProperty.call(this._style, key)) {
        style += `${key}:${this._style[key]} `;
      }
    }
    this._native.setAttribute('style', style);
  }

  static _calculateDefaultControlPoints(srcPos, tarPos) {
    const y = srcPos.y - tarPos.y;
    const x = srcPos.x - tarPos.x;
    const div = Math.abs(x) > 0.1 ? x : 0.1; // Prevent division by 0.

    const m = y / div;
    const l = Math.sqrt(y * y + x * x) / 3;
    let fix = 1;
    if (srcPos.x > tarPos.x) {
      fix = -1;
    }

    const x1 = srcPos.x + Math.sqrt((l * l) / (1 + m * m)) * fix;
    const y1 = m * (x1 - srcPos.x) + srcPos.y;
    const x2 = tarPos.x + Math.sqrt((l * l) / (1 + m * m)) * fix * -1;
    const y2 = m * (x2 - tarPos.x) + tarPos.y;

    return [
      new Point(-srcPos.x + x1, -srcPos.y + y1),
      new Point(-tarPos.x + x2, -tarPos.y + y2),
    ];
  }

  _calculateAutoControlPoints(avoidControlPointFix) {
    // Both points available, calculate real points
    const defaultpoints = CurvedLinePeer._calculateDefaultControlPoints(
      new Point(this._x1, this._y1),
      new Point(this._x2, this._y2),
    );
    if (
      !this._customControlPoint_1
      && !($defined(avoidControlPointFix) && avoidControlPointFix === 0)
    ) {
      this._control1.x = defaultpoints[0].x;
      this._control1.y = defaultpoints[0].y;
    }
    if (
      !this._customControlPoint_2
      && !($defined(avoidControlPointFix) && avoidControlPointFix === 1)
    ) {
      this._control2.x = defaultpoints[1].x;
      this._control2.y = defaultpoints[1].y;
    }
  }

  setDashed(length, spacing) {
    if ($defined(length) && $defined(spacing)) {
      this._native.setAttribute('stroke-dasharray', `${length},${spacing}`);
    } else {
      this._native.setAttribute('stroke-dasharray', '');
    }
  }
}

export default CurvedLinePeer;
