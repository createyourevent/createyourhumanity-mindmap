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
import $ from 'jquery';
import { $assert } from '@wisemapping/core-js';
import Keyboard from './Keyboard';
import { Designer } from '..';
import Topic from './Topic';

export type EventCallback = (event?: Event) => void;
class DesignerKeyboard extends Keyboard {
  // eslint-disable-next-line no-use-before-define
  static _instance: DesignerKeyboard;

  static _disabled: boolean;

  constructor(designer: Designer) {
    super();
    $assert(designer, 'designer can not be null');
    this._registerEvents(designer);
  }

  addShortcut(shortcuts: string[] | string, callback: EventCallback): void {
    super.addShortcut(shortcuts, (e: Event) => {
      if (DesignerKeyboard.isDisabled()) {
        return;
      }
      callback(e);
    });
  }

  private _registerEvents(designer: Designer) {
    // Try with the keyboard ..
    const model = designer.getModel();
    this.addShortcut(
      ['backspace'], (event: Event) => {
        event.preventDefault();
        event.stopPropagation();
        designer.deleteSelectedEntities();
      },
    );
    this.addShortcut(
      ['space'], (event: Event) => {
        designer.shrinkSelectedBranch();
        event.preventDefault();
        event.stopPropagation();
      },
    );
    this.addShortcut(
      ['f2'], (event: Event) => {
        event.stopPropagation();
        event.preventDefault();
        const node = model.selectedTopic();
        if (node) {
          node.showTextEditor(node.getText());
        }
      },
    );
    this.addShortcut(
      ['del'], (event: Event) => {
        designer.deleteSelectedEntities();
        event.preventDefault();
        event.stopPropagation();
      },
    );
    this.addShortcut(
      ['enter'], () => {
        designer.createSiblingForSelectedNode();
      },
    );
    this.addShortcut(
      ['insert'], (event: Event) => {
        designer.createChildForSelectedNode();
        event.preventDefault();
        event.stopPropagation();
      },
    );
    this.addShortcut(
      ['tab'], (eventevent: Event) => {
        designer.createChildForSelectedNode();
        eventevent.preventDefault();
        eventevent.stopPropagation();
      },
    );
    this.addShortcut(
      ['meta+enter'], (eventevent: Event) => {
        eventevent.preventDefault();
        eventevent.stopPropagation();
        designer.createChildForSelectedNode();
      },
    );
    this.addShortcut(
      ['ctrl+z', 'meta+z'], (event: Event) => {
        event.preventDefault();
        event.stopPropagation();
        designer.undo();
      },
    );
    this.addShortcut(
      ['ctrl+c', 'meta+c'], (event: Event) => {
        event.preventDefault();
        event.stopPropagation();
        designer.copyToClipboard();
      },
    );
    this.addShortcut(
      ['ctrl+l', 'meta+l'], (event: Event) => {
        event.preventDefault();
        event.stopPropagation();
        designer.addLink();
      },
    );
    this.addShortcut(
      ['ctrl+k', 'meta+k'], (event: Event) => {
        event.preventDefault();
        event.stopPropagation();
        designer.addNote();
      },
    );
    this.addShortcut(
      ['ctrl+p', 'meta+p'], (event: Event) => {
        event.preventDefault();
        event.stopPropagation();
        designer.addProperties();
      },
    );
    this.addShortcut(
      ['ctrl+v', 'meta+v'], (event: Event) => {
        event.preventDefault();
        event.stopPropagation();
        designer.pasteClipboard();
      },
    );
    this.addShortcut(
      ['ctrl+shift+z', 'meta+shift+z', 'ctrl+y', 'meta+y'], (event: Event) => {
        event.preventDefault();
        event.stopPropagation();
        designer.redo();
      },
    );
    this.addShortcut(
      ['ctrl+a', 'meta+a'], (event: Event) => {
        event.preventDefault();
        event.stopPropagation();
        designer.selectAll();
      },
    );
    this.addShortcut(
      ['ctrl+b', 'meta+b'], (event: Event) => {
        event.preventDefault();
        event.stopPropagation();

        designer.changeFontWeight();
      },
    );
    this.addShortcut(
      ['ctrl+s', 'meta+s'], (event: Event) => {
        event.preventDefault();
        event.stopPropagation();
        $(document).find('#save').trigger('click');
      },
    );
    this.addShortcut(
      ['ctrl+i', 'meta+i'], (event: Event) => {
        event.preventDefault();
        event.stopPropagation();

        designer.changeFontStyle();
      },
    );
    this.addShortcut(
      ['ctrl+shift+a', 'meta+shift+a'], (event: Event) => {
        event.preventDefault();
        event.stopPropagation();

        designer.deselectAll();
      },
    );
    this.addShortcut(
      ['meta+=', 'ctrl+='], (event: Event) => {
        event.preventDefault();
        event.stopPropagation();

        designer.zoomIn();
      },
    );
    this.addShortcut(
      ['meta+-', 'ctrl+-'], (event: Event) => {
        event.preventDefault();
        event.stopPropagation();

        designer.zoomOut();
      },
    );
    const me = this;
    this.addShortcut(
      'right', (event: Event) => {
        const node = model.selectedTopic();
        if (node) {
          if (node.isCentralTopic()) {
            me._goToSideChild(designer, node, 'RIGHT');
          } else if (node.getPosition().x < 0) {
            me._goToParent(designer, node);
          } else if (!node.areChildrenShrunken()) {
            me._goToChild(designer, node);
          }
        } else {
          const centralTopic = model.getCentralTopic();
          me._goToNode(designer, centralTopic);
        }
        event.preventDefault();
        event.stopPropagation();
      },
    );
    this.addShortcut(
      'left', (event: Event) => {
        const node = model.selectedTopic();
        if (node) {
          if (node.isCentralTopic()) {
            me._goToSideChild(designer, node, 'LEFT');
          } else if (node.getPosition().x > 0) {
            me._goToParent(designer, node);
          } else if (!node.areChildrenShrunken()) {
            me._goToChild(designer, node);
          }
        } else {
          const centralTopic = model.getCentralTopic();
          me._goToNode(designer, centralTopic);
        }
        event.preventDefault();
        event.stopPropagation();
      },
    );
    this.addShortcut(
      'up', (event: Event) => {
        const node = model.selectedTopic();
        if (node) {
          if (!node.isCentralTopic()) {
            me._goToBrother(designer, node, 'UP');
          }
        } else {
          const centralTopic = model.getCentralTopic();
          me._goToNode(designer, centralTopic);
        }
        event.preventDefault();
        event.stopPropagation();
      },
    );
    this.addShortcut(
      'down', (event: Event) => {
        const node = model.selectedTopic();
        if (node) {
          if (!node.isCentralTopic()) {
            me._goToBrother(designer, node, 'DOWN');
          }
        } else {
          const centralTopic = model.getCentralTopic();
          me._goToNode(designer, centralTopic);
        }
        event.preventDefault();
        event.stopPropagation();
      },
    );
    const excludes = ['esc', 'escape', 'f1', 'f3', 'f4', 'f5', 'f6', 'f7', 'f8', 'f9', 'f10', 'f11', 'f12'];

    $(document).on('keypress', (event) => {
      let keyCode: number;

      if (DesignerKeyboard.isDisabled()) {
        return;
      }
      // Firefox doesn't skip special keys for keypress event...
      if (event.key && excludes.includes(event.key.toLowerCase())) {
        return;
      }
      // Sometimes Firefox doesn't contain keyCode value
      if (event.key && event.keyCode === 0) {
        keyCode = event.charCode;
      } else {
        keyCode = event.keyCode;
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const jq: any = $;
      const specialKey = jq.hotkeys.specialKeys[keyCode];
      if (['enter', 'capslock'].indexOf(specialKey) === -1 && !jq.hotkeys.shiftNums[keyCode]) {
        const nodes = designer.getModel().filterSelectedTopics();
        if (nodes.length > 0) {
          // If a modifier is press, the key selected must be ignored.
          if (event.ctrlKey || event.altKey || event.metaKey) {
            return;
          }
          nodes[0].showTextEditor('');
          event.stopPropagation();
        }
      }
    });
  }

  private _goToBrother(designer: Designer, node: Topic, direction) {
    const parent = node.getParent();
    if (parent) {
      const brothers = parent.getChildren();

      let target = node;
      const { y } = node.getPosition();
      const { x } = node.getPosition();
      let dist = null;
      for (let i = 0; i < brothers.length; i++) {
        const sameSide = (x * brothers[i].getPosition().x) >= 0;
        if (brothers[i] !== node && sameSide) {
          const brother = brothers[i];
          const brotherY = brother.getPosition().y;
          if (direction === 'DOWN' && brotherY > y) {
            let distancia = y - brotherY;
            if (distancia < 0) {
              distancia *= (-1);
            }
            if (dist == null || dist > distancia) {
              dist = distancia;
              target = brothers[i];
            }
          } else if (direction === 'UP' && brotherY < y) {
            let distance = y - brotherY;
            if (distance < 0) {
              distance *= (-1);
            }
            if (dist == null || dist > distance) {
              dist = distance;
              target = brothers[i];
            }
          }
        }
      }
      this._goToNode(designer, target);
    }
  }

  private _goToSideChild(designer: Designer, node: Topic, side: 'LEFT' | 'RIGHT') {
    const children = node.getChildren();
    if (children.length > 0) {
      let target = children[0];
      let top = null;
      for (let i = 0; i < children.length; i++) {
        const child = children[i];
        const childY = child.getPosition().y;
        if (side === 'LEFT' && child.getPosition().x < 0) {
          if (top == null || childY < top) {
            target = child;
            top = childY;
          }
        }
        if (side === 'RIGHT' && child.getPosition().x > 0) {
          if (top == null || childY < top) {
            target = child;
            top = childY;
          }
        }
      }

      this._goToNode(designer, target);
    }
  }

  private _goToParent(designer: Designer, node: Topic) {
    const parent = node.getParent();
    if (parent) {
      this._goToNode(designer, parent);
    }
  }

  private _goToChild(designer: Designer, node: Topic) {
    const children = node.getChildren();
    if (children.length > 0) {
      let target = children[0];
      let top = target.getPosition().y;
      for (let i = 0; i < children.length; i++) {
        const child = children[i];
        if (child.getPosition().y < top) {
          top = child.getPosition().y;
          target = child;
        }
      }
      this._goToNode(designer, target);
    }
  }

  private _goToNode(designer: Designer, node: Topic) {
    // First deselect all the nodes ...
    designer.deselectAll();

    // Give focus to the selected node....
    node.setOnFocus(true);
  }

  static register = function register(designer: Designer) {
    this._instance = new DesignerKeyboard(designer);
    this._disabled = false;
  };

  static pause = function pause() {
    this._disabled = true;
  };

  static resume = function resume() {
    this._disabled = false;
  };

  static isDisabled = function isDisabled() {
    return this._disabled;
  };

  static specialKeys = {
    8: 'backspace',
    9: 'tab',
    10: 'return',
    13: 'enter',
    16: 'shift',
    17: 'ctrl',
    18: 'alt',
    19: 'pause',
    20: 'capslock',
    27: 'esc',
    32: 'space',
    33: 'pageup',
    34: 'pagedown',
    35: 'end',
    36: 'home',
    37: 'left',
    38: 'up',
    39: 'right',
    40: 'down',
    45: 'insert',
    46: 'del',
    96: '0',
    97: '1',
    98: '2',
    99: '3',
    100: '4',
    101: '5',
    102: '6',
    103: '7',
    104: '8',
    105: '9',
    106: '*',
    107: '+',
    109: '-',
    110: '.',
    111: '/',
    112: 'f1',
    113: 'f2',
    114: 'f3',
    115: 'f4',
    116: 'f5',
    117: 'f6',
    118: 'f7',
    119: 'f8',
    120: 'f9',
    121: 'f10',
    122: 'f11',
    123: 'f12',
    144: 'numlock',
    145: 'scroll',
    186: ';',
    191: '/',
    220: '\\',
    222: "'",
    224: 'meta',
  };

  static getInstance() {
    return this._instance;
  }
}

export default DesignerKeyboard;
