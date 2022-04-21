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
import { $assert, $defined } from '@wisemapping/core-js';
import EventUtils from '../utils/EventUtils';

class ElementPeer {
  constructor(svgElement) {
    this._native = svgElement;
    if (!this._native.addEvent) {
      // Hack bug: https://bugzilla.mozilla.org/show_bug.cgi?id=740811
      for (const key in Element) {
        if (Object.prototype.hasOwnProperty.call(Element, key)) {
          this._native[key] = Element.prototype[key];
        }
      }
    }

    this._size = { width: 1, height: 1 };
    this._changeListeners = {};
    // http://support.adobe.com/devsup/devsup.nsf/docs/50493.htm

    // __handlers stores handlers references so they can be removed afterwards
    this.__handlers = new Map();
  }

  setChildren(children) {
    this._children = children;
  }

  getChildren() {
    let result = this._children;
    if (!$defined(result)) {
      result = [];
      this._children = result;
    }
    return result;
  }

  getParent() {
    return this._parent;
  }

  setParent(parent) {
    this._parent = parent;
  }

  append(elementPeer) {
    // Store parent and child relationship.
    elementPeer.setParent(this);
    const children = this.getChildren();
    children.push(elementPeer);

    // Append element as a child.
    this._native.appendChild(elementPeer._native);

    // Broadcast events ...
    EventUtils.broadcastChangeEvent(this, 'strokeStyle');
  }

  removeChild(elementPeer) {
    // Store parent and child relationship.
    elementPeer.setParent(null);
    let children = this.getChildren();

    // Remove from children array ...
    const oldLength = children.length;

    children = children.filter((c) => c !== elementPeer);
    this.setChildren(children);

    $assert(
      children.length < oldLength,
      `element could not be removed:${elementPeer}`,
    );

    // Append element as a child.
    this._native.removeChild(elementPeer._native);
  }

  /**
     * http://www.w3.org/TR/DOM-Level-3-Events/events.html
     * http://developer.mozilla.org/en/docs/addEvent
     */
  addEvent(type, listener) {
    // wrap it so it can be ~backward compatible with jQuery.trigger
    const wrappedListener = (e) => listener(e, e.detail);
    this.__handlers.set(listener, wrappedListener);
    this._native.addEventListener(type, wrappedListener);
  }

  trigger(type, event) {
    // TODO: check this for correctness and for real jQuery.trigger replacement
    this._native.dispatchEvent(new CustomEvent(type, { detail: event }));
  }

  // eslint-disable-next-line class-methods-use-this
  cloneEvents(/* from */) {
    throw new Error('cloneEvents not implemented');
  }

  removeEvent(type, listener) {
    this._native.removeEventListener(type, this.__handlers.get(listener));
    this.__handlers.delete(listener);
  }

  setSize(width, height) {
    if ($defined(width) && this._size.width !== Number.parseFloat(width, 10)) {
      this._size.width = Number.parseFloat(width, 10);
      this._native.setAttribute('width', this._size.width.toFixed(2));
    }

    if ($defined(height) && this._size.height !== Number.parseFloat(height, 10)) {
      this._size.height = Number.parseFloat(height, 10);
      this._native.setAttribute('height', this._size.height.toFixed(2));
    }

    EventUtils.broadcastChangeEvent(this, 'strokeStyle');
  }

  getSize() {
    return { width: this._size.width, height: this._size.height };
  }

  setFill(color, opacity) {
    if ($defined(color)) {
      this._native.setAttribute('fill', color);
    }
    if ($defined(opacity)) {
      this._native.setAttribute('fill-opacity', opacity);
    }
  }

  getFill() {
    const color = this._native.getAttribute('fill');
    const opacity = this._native.getAttribute('fill-opacity');
    return { color, opacity: Number(opacity) };
  }

  getStroke() {
    const vmlStroke = this._native;
    const color = vmlStroke.getAttribute('stroke');
    const dashstyle = this._stokeStyle;
    const opacity = vmlStroke.getAttribute('stroke-opacity');
    const width = vmlStroke.getAttribute('stroke-width');
    return {
      color,
      style: dashstyle,
      opacity,
      width,
    };
  }

  setStroke(width, style, color, opacity) {
    if ($defined(width)) {
      this._native.setAttribute('stroke-width', `${width}px`);
    }
    if ($defined(color)) {
      this._native.setAttribute('stroke', color);
    }
    if ($defined(style)) {
      this._stokeStyle = style;
    }

    if ($defined(opacity)) {
      this._native.setAttribute('stroke-opacity', opacity);
    }
  }

  setVisibility(value, fade) {
    this._native.setAttribute('visibility', value ? 'visible' : 'hidden');
    this._native.style.opacity = value ? 1 : 0;
    if (fade) {
      this._native.style.transition = `visibility ${fade}ms, opacity ${fade}ms`;
    } else {
      this._native.style.transition = null;
    }
  }

  isVisible() {
    const visibility = this._native.getAttribute('visibility');
    return !(visibility === 'hidden');
  }

  updateStrokeStyle() {
    const strokeStyle = this._stokeStyle;
    if (this.getParent()) {
      if (strokeStyle && strokeStyle !== 'solid') {
        this.setStroke(null, strokeStyle);
      }
    }
  }

  attachChangeEventListener(type, listener) {
    const listeners = this.getChangeEventListeners(type);
    if (!$defined(listener)) {
      throw new Error('Listener can not be null');
    }
    listeners.push(listener);
  }

  getChangeEventListeners(type) {
    let listeners = this._changeListeners[type];
    if (!$defined(listeners)) {
      listeners = [];
      this._changeListeners[type] = listeners;
    }
    return listeners;
  }

  /**
     * Move element to the front
     */
  moveToFront() {
    this._native.parentNode.appendChild(this._native);
  }

  /**
     * Move element to the back
     */
  moveToBack() {
    this._native.parentNode.insertBefore(this._native, this._native.parentNode.firstChild);
  }

  setCursor(type) {
    this._native.style.cursor = type;
  }

  static stokeStyleToStrokDasharray() {
    return {
      solid: [],
      dot: [1, 3],
      dash: [4, 3],
      longdash: [10, 2],
      dashdot: [5, 3, 1, 3],
    };
  }
}

ElementPeer.svgNamespace = 'http://www.w3.org/2000/svg';
ElementPeer.linkNamespace = 'http://www.w3.org/1999/xlink';

export default ElementPeer;
