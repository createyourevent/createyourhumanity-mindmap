/* eslint-disable no-new */
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
// import $ from 'jquery';
import { Designer } from '@wisemapping/mindplot';
import FontFamilyPanel from './FontFamilyPanel';
import FontSizePanel from './FontSizePanel';
import TopicShapePanel from './TopicShapePanel';
import IconPanel from './IconPanel';
import ColorPalettePanel from './ColorPalettePanel';
import ToolbarItem from './ToolbarItem';
import KeyboardShortcutTooltip from './KeyboardShortcutTooltip';
import KeyboardShortcutDialog from './KeyboardShortcutDialog';
import AccountSettingsPanel from './AccountSettingsPanel';
import IMenu from './IMenu';
import { $msg } from '@wisemapping/mindplot';
import TopicHtmlPanel from './TopicHtmlPanel';
import TopicHtmlControlPanel from './TopicHtmlControlPanel';
import TopicHtmlLayoutPanel from './TopicHtmlLayoutPanel';

class Menu extends IMenu {
  constructor(designer: Designer, containerId: string, readOnly = false, baseUrl = '') {
    super(designer, containerId);
    const widgetsBaseUrl = `${baseUrl}css/widget`;

    // Create panels ...

    const designerModel = designer.getModel();

    // Common actions ....
    const backTolist = $('#backToList');
    backTolist.bind('click', (event) => {
      event.stopPropagation();
      window.location.href = '/c/maps/';
      return false;
    });
    Menu._registerTooltip('backToList', $msg('BACK_TO_MAP_LIST'));

    this._addButton('zoom-plus', false, false, () => {
      designer.zoomIn();
    });
    Menu._registerTooltip('zoom-plus', $msg('ZOOM_IN'));

    this._addButton('zoom-minus', false, false, () => {
      designer.zoomOut();
    });
    Menu._registerTooltip('zoom-minus', $msg('ZOOM_OUT'));

    this._addButton('position', false, false, () => {
      designer.zoomToFit();
    });
    Menu._registerTooltip('position', $msg('CENTER_POSITION'));

    // Edition actions ...
    if (!readOnly) {
      const fontFamilyModel = {
        getValue() {
          const nodes = designerModel.filterSelectedTopics();
          let result = null;
          for (let i = 0; i < nodes.length; i++) {
            const fontFamily = nodes[i].getFontFamily();
            if (result != null && result !== fontFamily) {
              result = null;
              break;
            }
            result = fontFamily;
          }
          return result;
        },

        setValue(value: string) {
          designer.changeFontFamily(value);
        },
      };
      this._toolbarElems.push(new FontFamilyPanel('fontFamily', fontFamilyModel));
      Menu._registerTooltip('fontFamily', $msg('FONT_FAMILY'));

      const fontSizeModel = {
        getValue(): number {
          const nodes = designerModel.filterSelectedTopics();

          let result = null;
          for (let i = 0; i < nodes.length; i++) {
            const fontSize = nodes[i].getFontSize();
            if (result != null && result !== fontSize) {
              result = null;
              break;
            }
            result = fontSize;
          }
          return result;
        },
        setValue(value: number) {
          designer.changeFontSize(value);
        },
      };
      this._toolbarElems.push(new FontSizePanel('fontSize', fontSizeModel));
      Menu._registerTooltip('fontSize', $msg('FONT_SIZE'));

      const topicShapeModel = {
        getValue() {
          const nodes = designerModel.filterSelectedTopics();
          let result = null;
          for (let i = 0; i < nodes.length; i++) {
            const shapeType = nodes[i].getShapeType();
            if (result != null && result !== shapeType) {
              result = null;
              break;
            }
            result = shapeType;
          }
          return result;
        },
        setValue(value: string) {
          designer.changeTopicShape(value);
        },
      };
      this._toolbarElems.push(new TopicShapePanel('topicShape', topicShapeModel));
      Menu._registerTooltip('topicShape', $msg('TOPIC_SHAPE'));

      // Create icon panel dialog ...
      const topicIconModel = {
        getValue() {
          return null;
        },
        setValue(value: string) {
          designer.addIconType(value);
        },
      };
      this._toolbarElems.push(new IconPanel('topicIcon', topicIconModel));
      Menu._registerTooltip('topicIcon', $msg('TOPIC_ICON'));

      const topicColorModel = {
        getValue() {
          const nodes = designerModel.filterSelectedTopics();
          let result = null;
          for (let i = 0; i < nodes.length; i++) {
            const color = nodes[i].getBackgroundColor();
            if (result != null && result !== color) {
              result = null;
              break;
            }
            result = color;
          }
          return result;
        },
        setValue(hex: string) {
          designer.changeBackgroundColor(hex);
        },
      };
      this._toolbarElems.push(new ColorPalettePanel('topicColor', topicColorModel, widgetsBaseUrl));
      Menu._registerTooltip('topicColor', $msg('TOPIC_COLOR'));

      const borderColorModel = {
        getValue() {
          const nodes = designerModel.filterSelectedTopics();
          let result = null;
          for (let i = 0; i < nodes.length; i++) {
            const color = nodes[i].getBorderColor();
            if (result != null && result !== color) {
              result = null;
              break;
            }
            result = color;
          }
          return result;
        },
        setValue(hex: string) {
          designer.changeBorderColor(hex);
        },
      };
      this._toolbarElems.push(new ColorPalettePanel('topicBorder', borderColorModel, widgetsBaseUrl));
      Menu._registerTooltip('topicBorder', $msg('TOPIC_BORDER_COLOR'));

      const fontColorModel = {
        getValue() {
          let result = null;
          const nodes = designerModel.filterSelectedTopics();
          for (let i = 0; i < nodes.length; i++) {
            const color = nodes[i].getFontColor();
            if (result != null && result !== color) {
              result = null;
              break;
            }
            result = color;
          }
          return result;
        },
        setValue(hex) {
          designer.changeFontColor(hex);
        },
      };
      this._toolbarElems.push(new ColorPalettePanel('fontColor', fontColorModel, baseUrl));
      Menu._registerTooltip('fontColor', $msg('FONT_COLOR'));

      const undoButton = this._addButton('undoEdition', false, false, () => {
        designer.undo();
      });
      if (undoButton) {
        undoButton.disable();
      }
      Menu._registerTooltip('undoEdition', $msg('UNDO'));

      const redoButton = this._addButton('redoEdition', false, false, () => {
        designer.redo();
      });
      if (redoButton) {
        redoButton.disable();
      }
      Menu._registerTooltip('redoEdition', $msg('REDO'));

      if (redoButton && undoButton) {
        designer.addEvent('modelUpdate', (event) => {
          if (event.undoSteps > 0) {
            undoButton.enable();
          } else {
            undoButton.disable();
          }
          if (event.redoSteps > 0) {
            redoButton.enable();
          } else {
            redoButton.disable();
          }
        });
      }

            //Create Html Form Panel ...
            const topicHtmlModel = {
              getValue() {
                const nodes = designerModel.filterSelectedTopics();
                let result = null;
                for (let i = 0; i < nodes.length; i++) {
                  const htmlType = nodes[i].getHtmlType();
                  if (result != null && result !== htmlType) {
                    result = null;
                    break;
                  }
                  result = htmlType;
                }
                return result;
              },
              setValue(value: string) {
                designer.addHtml(value);
              },
            };
            this._toolbarElems.push(new TopicHtmlPanel('topicHtml', topicHtmlModel));
            Menu._registerTooltip('topicHtml', $msg('TOPIC_HTML'));
      
            //Create Html Form Panel ...
            const topicHtmlControlModel = {
              getValue() {
                const nodes = designerModel.filterSelectedTopics();
                let result = null;
                for (let i = 0; i < nodes.length; i++) {
                  const htmlType = nodes[i].getHtmlType();
                  if (result != null && result !== htmlType) {
                    result = null;
                    break;
                  }
                  result = htmlType;
                }
                return result;
              },
              setValue(value: string) {
                designer.addControl(value);
              },
            };
            this._toolbarElems.push(new TopicHtmlControlPanel('topicHtmlControl', topicHtmlControlModel));
            Menu._registerTooltip('topicHtmlControl', $msg('TOPIC_HTML_CONTROL'));


            //Create Html Layout Panel ...
            const topicHtmlLayoutModel = {
              getValue() {
                const nodes = designerModel.filterSelectedTopics();
                let result = null;
                for (let i = 0; i < nodes.length; i++) {
                  const htmlType = nodes[i].getHtmlType();
                  if (result != null && result !== htmlType) {
                    result = null;
                    break;
                  }
                  result = htmlType;
                }
                return result;
              },
              setValue(value: string) {
                designer.addLayout(value);
              },
            };
            this._toolbarElems.push(new TopicHtmlLayoutPanel('topicHtmlLayoutControl', topicHtmlLayoutModel));
            Menu._registerTooltip('topicHtmlLayoutControl', $msg('TOPIC_HTML_LAYOUT'));



              const formElem = $('#form');
              this._addButton('form', false, false,
                () => {
                  this.addForm(formElem, designer, true);
                });
              Menu._registerTooltip('form', $msg('FORM'));

            
      this._addButton('addTopic', true, false, () => {
        designer.createSiblingForSelectedNode();
      });
      Menu._registerTooltip('addTopic', $msg('ADD_TOPIC'));

      this._addButton('deleteTopic', true, true, () => {
        designer.deleteSelectedEntities();
      });
      Menu._registerTooltip('deleteTopic', $msg('TOPIC_DELETE'));

      this._addButton('topicLink', true, false, () => {
        designer.addLink();
      });
      Menu._registerTooltip('topicLink', $msg('TOPIC_LINK'));

      this._addButton('topicRelation', true, false, (event) => {
        designer.showRelPivot(event);
      });
      Menu._registerTooltip('topicRelation', $msg('TOPIC_RELATIONSHIP'));

      this._addButton('topicNote', true, false, () => {
        designer.addNote();
      });
      Menu._registerTooltip('topicNote', $msg('TOPIC_NOTE'));

      this._addButton('fontBold', true, false, () => {
        designer.changeFontWeight();
      });
      Menu._registerTooltip('fontBold', $msg('FONT_BOLD'), 'meta+B');

      this._addButton('fontItalic', true, false, () => {
        designer.changeFontStyle();
      });
      Menu._registerTooltip('fontItalic', $msg('FONT_ITALIC'), 'meta+I');


      if (!readOnly) {
        // Register action on save  ...
        const saveElem = $('#save');
        this._addButton('save', false, false,
          () => {
            this.save(saveElem, designer, true);
          });
        Menu._registerTooltip('save', $msg('SAVE'));

        // Register unload save ...
        window.addEventListener('beforeunload', () => {
          if (this.isSaveRequired()) {
            this.save(saveElem, designer, false);
          }
          this.unlockMap(designer);
        });

        // Autosave on a fixed period of time ...
        setInterval(
          () => {
            if (this.isSaveRequired()) {
              this.save(saveElem, designer, false);
            }
          }, 10000,
        );
      }
    }

    Menu._registerTooltip('export', $msg('EXPORT'));

    Menu._registerTooltip('print', $msg('PRINT'));

    const shareElem = $('#shareIt');
    if (shareElem.length !== 0) {
      Menu._registerTooltip('shareIt', $msg('COLLABORATE'));
    }

    const publishElem = $('#publishIt');
    if (publishElem.length !== 0) {
      Menu._registerTooltip('publishIt', $msg('PUBLISH'));
    }

    const historyElem = $('#history');
    if (historyElem.length !== 0) {
      Menu._registerTooltip('history', $msg('HISTORY'));
    }

    // Keyboard Shortcuts Action ...
    const keyboardShortcut = $('#keyboardShortcuts');
    if (keyboardShortcut.length !== 0) {
      keyboardShortcut.bind('click', (event) => {
        new KeyboardShortcutDialog();
        designer.onObjectFocusEvent();
        event.preventDefault();
      });
      Menu._registerTooltip('keyboardShortcuts', $msg('KEYBOARD_SHOTCUTS'));
    }

    // Account dialog ...
    const accountSettings = $('#account');
    if (accountSettings.length !== 0) {
      accountSettings.bind('click', (event) => {
        event.preventDefault();
      });
      this._toolbarElems.push(new AccountSettingsPanel('account'));
      Menu._registerTooltip('account', `${global.accountEmail}`);

      this._registerEvents(designer);
    }
  }

  private _registerEvents(designer: Designer) {
    // Register on close events ...
    this._toolbarElems.forEach((panel) => {
      panel.addEvent('show', () => {
        this.clear();
      });
    });

    designer.addEvent('onblur', () => {
      const topics = designer.getModel().filterSelectedTopics();
      const rels = designer.getModel().filterSelectedRelationships();

      this._toolbarElems.forEach((panel) => {
        const isTopicAction = panel.isTopicAction();
        const isRelAction = panel.isRelAction();

        if (isTopicAction || isRelAction) {
          if ((isTopicAction && topics.length !== 0) || (isRelAction && rels.length !== 0)) {
            panel.enable();
          } else {
            panel.disable();
          }
        }
      });
    });

    designer.addEvent('onfocus', () => {
      const topics = designer.getModel().filterSelectedTopics();
      const rels = designer.getModel().filterSelectedRelationships();

      this._toolbarElems.forEach((button) => {
        const isTopicAction = button.isTopicAction();
        const isRelAction = button.isRelAction();

        if (isTopicAction || isRelAction) {
          if (isTopicAction && topics.length > 0) {
            button.enable();
          }

          if (isRelAction && rels.length > 0) {
            button.enable();
          }
        }
      });
    });
  }

  private _addButton(buttonId: string, isTopic: boolean, isRelationship: boolean, fn) {
    // Register Events ...
    let result = null;
    if ($(`#${buttonId}`)) {
      const button = new ToolbarItem(buttonId, ((event) => {
        fn(event);
        this.clear();
      }), { topicAction: isTopic, relAction: isRelationship });

      this._toolbarElems.push(button);
      result = button;
    }
    return result;
  }

  private static _registerTooltip(buttonId: string, text: string, shortcut: string = null) {
    if ($(`#${buttonId}`)) {
      let tooltip = text;
      if (shortcut) {
        const platformedShortcut = navigator.appVersion.indexOf('Mac') !== -1
          ? shortcut.replace('meta+', '⌘')
          : shortcut.replace('meta+', 'ctrl+');
        tooltip = `${tooltip} (${platformedShortcut})`;
      }
      return new KeyboardShortcutTooltip($(`#${buttonId}`), tooltip);
    }
    return undefined;
  }
}

export default Menu;
