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
import { Point } from '@wisemapping/web2d';

class ScreenManager {
  private _divContainer: JQuery;

  private _padding: { x: number; y: number; };

  private _clickEvents;

  private _scale: number;

  constructor(divElement: JQuery) {
    $assert(divElement, 'can not be null');
    this._divContainer = divElement;
    this._padding = { x: 0, y: 0 };

    // Ignore default click event propagation. Prevent 'click' event on drag.
    this._clickEvents = [];
    this._divContainer.bind('click', (event: { stopPropagation: () => void; }) => {
      event.stopPropagation();
    });

    this._divContainer.bind('dblclick', (event: { stopPropagation: () => void; preventDefault: () => void; }) => {
      event.stopPropagation();
      event.preventDefault();
    });
  }

  /**
   * Return the current visibile area in the browser.
   */
  getVisibleBrowserSize(): { width: number, height: number } {
    return {
      width: window.innerWidth,
      height: window.innerHeight - Number.parseInt(this._divContainer.css('top'), 10),
    };
  }

  setScale(scale: number) {
    $assert(scale, 'Screen scale can not be null');
    this._scale = scale;
  }

  addEvent(eventType: string, listener) {
    if (eventType === 'click') this._clickEvents.push(listener);
    else this._divContainer.bind(eventType, listener);
  }

  removeEvent(event: string, listener) {
    if (event === 'click') {
      this._clickEvents.remove(listener);
    } else {
      this._divContainer.unbind(event, listener);
    }
  }

  fireEvent(type: string, event: UIEvent = null) {
    if (type === 'click') {
      this._clickEvents.forEach((listener) => {
        listener(type, event);
      });
    } else {
      this._divContainer.trigger(type, event);
    }
  }

  getWorkspaceMousePosition(event: MouseEvent) {
    // Retrieve current mouse position.
    let x = event.clientX;
    let y = event.clientY;

    // Adjust the deviation of the container positioning ...
    const containerPosition = this.getContainer().position();
    x -= containerPosition.left;
    y -= containerPosition.top;

    // Scale coordinate in order to be relative to the workspace. That's coordSize/size;
    x *= this._scale;
    y *= this._scale;

    // Add workspace offset.
    x += this._padding.x;
    y += this._padding.y;

    // Remove decimal part..
    return new Point(x, y);
  }

  getContainer() {
    return this._divContainer;
  }

  setOffset(x: number, y: number) {
    this._padding.x = x;
    this._padding.y = y;
  }
}

export default ScreenManager;
