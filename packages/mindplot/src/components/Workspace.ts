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
import { Workspace as Workspace2D, ElementClass as Element2D } from '@wisemapping/web2d';
import ScreenManager from './ScreenManager';
import SizeType from './SizeType';

class Workspace {
  private _zoom: number;

  private _screenManager: ScreenManager;

  private _isReadOnly: boolean;

  private _containerSize: SizeType;

  private _workspace: Workspace2D;

  private _eventsEnabled: boolean;

  private _visibleAreaSize: SizeType;

  constructor(screenManager: ScreenManager, zoom: number, isReadOnly: boolean) {
    // Create a suitable container ...
    $assert(screenManager, 'Div container can not be null');
    $assert(zoom, 'zoom container can not be null');

    this._zoom = zoom;
    this._screenManager = screenManager;
    this._isReadOnly = isReadOnly;

    const divContainer = screenManager.getContainer();
    this._containerSize = {
      width: Number.parseInt(divContainer.css('width'), 10),
      height: Number.parseInt(divContainer.css('height'), 10),
    };
    // Initialize web2d workspace.
    const workspace = this._createWorkspace();
    this._workspace = workspace;

    // Append to the workspace...
    workspace.addItAsChildTo(divContainer);

    // Register drag events ...
    this._registerDragEvents();
    this._eventsEnabled = true;

    // Readjust if the window is resized ...
    window.addEventListener('resize', () => {
      this._adjustWorkspace();
    });

    this.setZoom(zoom, true);
  }

  private _adjustWorkspace(): void {
    this.setZoom(this._zoom, false);
  }

  isReadOnly(): boolean {
    return this._isReadOnly;
  }

  private _createWorkspace(): Workspace2D {
    // Initialize workspace ...
    const browserVisibleSize = this._screenManager.getVisibleBrowserSize();
    const coordOriginX = -(browserVisibleSize.width / 2);
    const coordOriginY = -(browserVisibleSize.height / 2);

    const workspaceProfile = {
      width: `${this._containerSize.width}px`,
      height: `${this._containerSize.height}px`,
      coordSizeWidth: browserVisibleSize.width,
      coordSizeHeight: browserVisibleSize.height,
      coordOriginX,
      coordOriginY,
      fillColor: 'transparent',
      strokeWidth: 0,
    };

    return new Workspace2D(workspaceProfile);
  }

  append(shape: Element2D): void {
    if ($defined(shape.addToWorkspace)) {
      shape.addToWorkspace(this);
    } else {
      this._workspace.append(shape);
    }
  }

  removeChild(shape: Element2D): void {
    // Element is a node, not a web2d element?
    if ($defined(shape.removeFromWorkspace)) {
      shape.removeFromWorkspace(this);
    } else {
      this._workspace.removeChild(shape);
    }
  }

  addEvent(type: string, listener: (event: Event) => void): void {
    this._workspace.addEvent(type, listener);
  }

  removeEvent(type: string, listener: (event: Event) => void): void {
    $assert(type, 'type can not be null');
    $assert(listener, 'listener can not be null');
    this._workspace.removeEvent(type, listener);
  }

  getSize(): SizeType {
    return this._workspace.getCoordSize();
  }

  setZoom(zoom: number, center = false): void {
    this._zoom = zoom;
    const workspace = this._workspace;
    const newVisibleAreaSize = this._screenManager.getVisibleBrowserSize();

    // Update coord scale...
    const newCoordWidth = zoom * this._containerSize.width;
    const newCoordHeight = zoom * this._containerSize.height;

    let coordOriginX: number;
    let coordOriginY: number;
    if (center) {
      // Center and define a new center of coordinates ...
      coordOriginX = -(newVisibleAreaSize.width / 2) * zoom;
      coordOriginY = -(newVisibleAreaSize.height / 2) * zoom;
    } else {
      const oldCoordOrigin = workspace.getCoordOrigin();

      // Next coordSize is always centered in the middle of the visible area ...
      const newCoordOriginX = -(newVisibleAreaSize.width / 2) * zoom;
      const newCoordOriginY = -(newVisibleAreaSize.height / 2) * zoom;

      // Calculate the offset with the original center to ...
      const oldCenterOriginX = -(this._visibleAreaSize.width / 2) * zoom;
      const oldCenterOriginY = -(this._visibleAreaSize.height / 2) * zoom;

      const offsetX = oldCoordOrigin.x - oldCenterOriginX;
      const offsetY = oldCoordOrigin.y - oldCenterOriginY;

      // Update to new coordinate ...
      coordOriginX = Math.round(newCoordOriginX + offsetX);
      coordOriginY = Math.round(newCoordOriginY + offsetY);
    }

    workspace.setCoordOrigin(coordOriginX, coordOriginY);
    workspace.setCoordSize(newCoordWidth, newCoordHeight);
    this._visibleAreaSize = newVisibleAreaSize;

    // Update screen.
    this._screenManager.setOffset(coordOriginX, coordOriginY);
    this._screenManager.setScale(zoom);

    // Some changes in the screen. Let's fire an update event...
    this._screenManager.fireEvent('update');
  }

  getScreenManager(): ScreenManager {
    return this._screenManager;
  }

  enableWorkspaceEvents(value: boolean) {
    this._eventsEnabled = value;
  }

  isWorkspaceEventsEnabled(): boolean {
    return this._eventsEnabled;
  }

  getSVGElement() {
    return this._workspace.getSVGElement();
  }

  private _registerDragEvents() {
    const workspace = this._workspace;
    const screenManager = this._screenManager;
    const mWorkspace = this;
    const mouseDownListener = function mouseDownListener(event: MouseEvent) {
      if (!$defined(workspace._mouseMoveListener)) {
        if (mWorkspace.isWorkspaceEventsEnabled()) {
          mWorkspace.enableWorkspaceEvents(false);

          const mouseDownPosition = screenManager.getWorkspaceMousePosition(event);
          const originalCoordOrigin = workspace.getCoordOrigin();

          let wasDragged = false;
          workspace._mouseMoveListener = (mouseMoveEvent: MouseEvent) => {
            const currentMousePosition = screenManager.getWorkspaceMousePosition(mouseMoveEvent);

            const offsetX = currentMousePosition.x - mouseDownPosition.x;
            const coordOriginX = -offsetX + originalCoordOrigin.x;

            const offsetY = currentMousePosition.y - mouseDownPosition.y;
            const coordOriginY = -offsetY + originalCoordOrigin.y;

            workspace.setCoordOrigin(coordOriginX, coordOriginY);

            // Change cursor.
            window.document.body.style.cursor = 'move';
            mouseMoveEvent.preventDefault();

            // Fire drag event ...
            screenManager.fireEvent('update');
            wasDragged = true;
          };
          screenManager.addEvent('mousemove', workspace._mouseMoveListener);

          // Register mouse up listeners ...
          workspace._mouseUpListener = () => {
            screenManager.removeEvent('mousemove', workspace._mouseMoveListener);
            screenManager.removeEvent('mouseup', workspace._mouseUpListener);
            workspace._mouseUpListener = null;
            workspace._mouseMoveListener = null;
            window.document.body.style.cursor = 'default';

            // Update screen manager offset.
            const coordOrigin = workspace.getCoordOrigin();
            screenManager.setOffset(coordOrigin.x, coordOrigin.y);
            mWorkspace.enableWorkspaceEvents(true);

            if (!wasDragged) {
              screenManager.fireEvent('click');
            }
          };
          screenManager.addEvent('mouseup', workspace._mouseUpListener);
        }
      } else {
        workspace._mouseUpListener();
      }
    };
    screenManager.addEvent('mousedown', mouseDownListener);
  }
}

export default Workspace;
