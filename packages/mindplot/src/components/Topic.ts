
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
import { $assert, $defined } from '@wisemapping/core-js';

import {
  Rect, Image, Line, Text, Group, ElementClass, Point,
} from '@wisemapping/web2d';

import NodeGraph from './NodeGraph';
import TopicConfig from './TopicConfig';
import TopicStyle from './TopicStyle';
import TopicFeatureFactory from './TopicFeature';
import ConnectionLine from './ConnectionLine';
import IconGroup from './IconGroup';
import EventBus from './layout/EventBus';
import ShirinkConnector from './ShrinkConnector';
import NoteEditor from './widget/NoteEditor';
import ActionDispatcher from './ActionDispatcher';
import LinkEditor from './widget/LinkEditor';

import TopicEventDispatcher, { TopicEvent } from './TopicEventDispatcher';
import { TopicShape } from './model/INodeModel';
import NodeModel from './model/NodeModel';
import Relationship from './Relationship';
import Workspace from './Workspace';
import LayoutManager from './layout/LayoutManager';
import NoteModel from './model/NoteModel';
import LinkModel from './model/LinkModel';
import SizeType from './SizeType';
import FeatureModel from './model/FeatureModel';
import Icon from './Icon';
import ControlModel from './model/ControlModel';
import TopicControlFactory from './ControlFeature';
import PropertiesEditor from './widget/PropertiesEditor';
import TextfieldModel from './model/control/TextfieldModel';
import TextareaModel from './model/control/TextareaModel';
import CheckboxModel from './model/control/CheckboxModel';
import SelectModel from './model/control/SelectModel';
import { result, size } from 'lodash';
import RadiogroupModel from './model/control/RadiogroupModel';
import OptionModel from './model/control/OptionModel';
import RadioModel from './model/control/RadioModel';
import LayoutModel from './model/LayoutModel';
import TopicLayoutFactory from './LayoutFeature';
import AddressModel from './model/control/AddressModel';
import CalendarModel from './model/control/CalendarModel';
import EditorModel from './model/control/EditorModel';
import KeywordsModel from './model/control/KeywordsModel';
import RatingsModel from './model/control/RatingsModel';
import TimeModel from './model/control/TimeModel';

const ICON_SCALING_FACTOR = 1.3;

abstract class Topic extends NodeGraph {
  private _innerShape: ElementClass;

  private _relationships: Relationship[];

  private _isInWorkspace: boolean;

  // eslint-disable-next-line no-use-before-define
  private _children: Topic[];

  // eslint-disable-next-line no-use-before-define
  private _parent: Topic | null;

  private _outerShape: ElementClass;

  private _text: Text | null;

  private _iconsGroup: IconGroup;

  private _connector: ShirinkConnector;

  private _outgoingLine: Line;

  constructor(model: NodeModel, options) {
    super(model, options);
    this._children = [];
    this._parent = null;
    this._relationships = [];
    this._isInWorkspace = false;
    this._buildTopicShape();

    // Position a topic ....
    const pos = model.getPosition();
    if (pos != null && this.isCentralTopic()) {
      this.setPosition(pos);
    }

    // Register events for the topic ...
    if (!this.isReadOnly()) {
      this._registerEvents();
    }
  }

  protected _registerEvents(): void {
    this.setMouseEventsEnabled(true);

    // Prevent click on the topics being propagated ...
    this.addEvent('click', (event: Event) => {
      event.stopPropagation();
    });
    const me = this;
    this.addEvent('dblclick', (event: Event) => {
      me._getTopicEventDispatcher().show(me);
      event.stopPropagation();
    });
  }

  setShapeType(type: string): void {
    this._setShapeType(type, true);
  }

  getParent(): Topic | null {
    return this._parent;
  }

  protected _setShapeType(type: string, updateModel: boolean) {
    // Remove inner shape figure ...
    const model = this.getModel();
    if ($defined(updateModel) && updateModel) {
      model.setShapeType(type);
    }
    // If shape is line, reset background color to default.
    if (type === TopicShape.LINE) {
      const color = TopicStyle.defaultBackgroundColor(this);
      this.setBackgroundColor(color);
    }

    const oldInnerShape = this.getInnerShape();
    if (oldInnerShape != null) {
      this._removeInnerShape();

      // Create a new one ...
      const innerShape = this.getInnerShape();

      // Update figure size ...
      const size = this.getSize();
      this.setSize(size, true);

      const group = this.get2DElement();
      group.append(innerShape);

      // Move text to the front ...
      const text = this.getTextShape();
      text.moveToFront();

      // Move iconGroup to front ...
      const iconGroup = this.getIconGroup();
      if ($defined(iconGroup)) {
        iconGroup.moveToFront();
      }

      // Move connector to front
      const connector = this.getShrinkConnector();
      if ($defined(connector)) {
        connector.moveToFront();
      }
    }
  }

  

  getShapeType(): string {
    const model = this.getModel();
    let result = model.getShapeType();
    if (!$defined(result)) {
      result = TopicStyle.defaultShapeType(this);
    }
    return result;
  }

  private _removeInnerShape(): ElementClass {
    const group = this.get2DElement();
    const innerShape = this.getInnerShape();
    group.removeChild(innerShape);
    this._innerShape = null;
    return innerShape;
  }

  getInnerShape(): ElementClass {
    if (!$defined(this._innerShape)) {
      // Create inner box.
      this._innerShape = this._buildShape(
        TopicConfig.INNER_RECT_ATTRIBUTES,
        this.getShapeType(),
      );

      // Update bgcolor ...
      const bgColor = this.getBackgroundColor();
      this._setBackgroundColor(bgColor, false);

      // Update border color ...
      const brColor = this.getBorderColor();
      this._setBorderColor(brColor, false);

      // Define the pointer ...
      if (!this.isCentralTopic() && !this.isReadOnly()) {
        this._innerShape.setCursor('move');
      } else {
        this._innerShape.setCursor('default');
      }
    }
    return this._innerShape;
  }

  _buildShape(attributes, shapeType: string) {
    $assert(attributes, 'attributes can not be null');
    $assert(shapeType, 'shapeType can not be null');

    let result;
    if (shapeType === TopicShape.RECTANGLE) {
      result = new Rect(0, attributes);
    } else if (shapeType === TopicShape.IMAGE) {
      const model = this.getModel();
      const url = model.getImageUrl();
      const size = model.getImageSize();

      result = new Image();
      result.setHref(url);
      result.setSize(size.width, size.height);

      result.getSize = function getSize() {
        return model.getImageSize();
      };

      result.setPosition = function setPosition() {
        // Ignore ...
      };
    } else if (shapeType === TopicShape.ELLIPSE) {
      result = new Rect(0.9, attributes);
    } else if (shapeType === TopicShape.ROUNDED_RECT) {
      result = new Rect(0.3, attributes);
    } else if (shapeType === TopicShape.LINE) {
      result = new Line({
        strokeColor: '#495879',
        strokeWidth: 1,
      });

      result.setSize = function setSize(width: number, height: number) {
        this.size = {
          width,
          height,
        };
        result.setFrom(0, height);
        result.setTo(width, height);

        // Lines will have the same color of the default connection lines...
        const stokeColor = ConnectionLine.getStrokeColor();
        result.setStroke(1, 'solid', stokeColor);
      };

      result.getSize = function getSize() { return this.size; };

      result.setPosition = () => {
        // Overwrite behaviour ...
      };

      result.setFill = () => {
        // Overwrite behaviour ...
      };

      result.setStroke = () => {
        // Overwrite behaviour ...
      };
    } else {
      $assert(false, `Unsupported figure shapeType:${shapeType}`);
    }
    result.setPosition(0, 0);
    return result;
  }

  setCursor(type: string) {
    const innerShape = this.getInnerShape();
    innerShape.setCursor(type);

    const outerShape = this.getOuterShape();
    outerShape.setCursor(type);

    const textShape = this.getTextShape();
    textShape.setCursor(type);
  }

  getOuterShape(): ElementClass {
    if (!$defined(this._outerShape)) {
      const rect = this._buildShape(
        TopicConfig.OUTER_SHAPE_ATTRIBUTES,
        TopicShape.ROUNDED_RECT,
      );
      rect.setPosition(-2, -3);
      rect.setOpacity(0);
      this._outerShape = rect;
    }

    return this._outerShape;
  }

  getTextShape(): Text {
    if (!$defined(this._text)) {
      this._text = this._buildTextShape(false);

      // Set Text ...
      const text = this.getText();
      this._setText(text, false);
    }

    return this._text;
  }

  getOrBuildIconGroup(): Group {
    if (!$defined(this._iconsGroup)) {
      this._iconsGroup = this._buildIconGroup();
      const group = this.get2DElement();
      group.append(this._iconsGroup.getNativeElement());
      this._iconsGroup.moveToFront();
    }
    return this._iconsGroup;
  }

  /** */
  getIconGroup(): IconGroup {
    return this._iconsGroup;
  }

  getHtmlType() {
    const model = this.getModel();
    let result = model.getHtmlType();
    return result;
  }

  private _buildIconGroup(): Group {
    const textHeight = this.getTextShape().getFontHeight();
    const iconSize = textHeight * ICON_SCALING_FACTOR;
    const result = new IconGroup(this.getId(), iconSize);
    const padding = TopicStyle.getInnerPadding(this);
    result.setPosition(padding, padding);

    // Load topic features ...
    const model = this.getModel();
    if (model.getFeatures().length > 0) {
      const featuresModel = model.getFeatures();
      featuresModel.forEach((f) => {
        const icon = TopicFeatureFactory.createIcon(this, f, this.isReadOnly());
        result.addIcon(icon, f.getType() === TopicFeatureFactory.Icon.id && !this.isReadOnly());
      });
    } else if (model.getControls().length > 0) {
      // Load topic controls ...
      const modelControl = this.getModel();
      const controlsModel = modelControl.getControls();
      controlsModel.forEach((f) => {
        const icon = TopicControlFactory.createIcon(this, f, this.isReadOnly());
        switch(f.getType()) { 
          case 'textfield': {  
            result.addIcon(icon, f.getType() === TopicControlFactory.Textfield.id && !this.isReadOnly(), 'control'); 
            break;
          } 
          case 'textarea': {  
            result.addIcon(icon, f.getType() === TopicControlFactory.Textarea.id && !this.isReadOnly(), 'control');
            break; 
          } 
          case 'select': {  
            result.addIcon(icon, f.getType() === TopicControlFactory.Select.id && !this.isReadOnly(), 'control');
            break; 
          } 
          case 'radio': {  
            result.addIcon(icon, f.getType() === TopicControlFactory.Radio.id && !this.isReadOnly(), 'control');
            break; 
          } 
          case 'checkbox': {  
            result.addIcon(icon, f.getType() === TopicControlFactory.Checkbox.id && !this.isReadOnly(), 'control');
            break; 
          } 
          case 'radiogroup': {  
            result.addIcon(icon, f.getType() === TopicControlFactory.Radiogroup.id && !this.isReadOnly(), 'control');
            break; 
          } 
          case 'option': {  
            result.addIcon(icon, f.getType() === TopicControlFactory.Option.id && !this.isReadOnly(), 'control');
            break; 
          } 
          case 'calendar': {  
            result.addIcon(icon, f.getType() === TopicControlFactory.Calendar.id && !this.isReadOnly(), 'control');
            break; 
          } 
          case 'editor': {  
            result.addIcon(icon, f.getType() === TopicControlFactory.Editor.id && !this.isReadOnly(), 'control');
            break; 
          } 
          case 'time': {  
            result.addIcon(icon, f.getType() === TopicControlFactory.Time.id && !this.isReadOnly(), 'control');
            break; 
          } 
          case 'address': {  
            result.addIcon(icon, f.getType() === TopicControlFactory.Address.id && !this.isReadOnly(), 'control');
            break; 
          } 
          case 'keywords': {  
            result.addIcon(icon, f.getType() === TopicControlFactory.Keywords.id && !this.isReadOnly(), 'control');
            break; 
          } 
          case 'ratings': {  
            result.addIcon(icon, f.getType() === TopicControlFactory.Ratings.id && !this.isReadOnly(), 'control');
            break; 
          } 
          default: {  
             break; 
          } 
       } 
      });
    } else if (model.getLayout().length > 0) {
      // Load topic controls ...
      const modelLayout = this.getModel();
      const layoutsModel = modelLayout.getLayout();
      layoutsModel.forEach((f) => {
        const icon = TopicLayoutFactory.createIcon(this, f, this.isReadOnly());
        switch(f.getType()) { 
          case 'desc': {  
            result.addIcon(icon, f.getType() === TopicLayoutFactory.Description.id && !this.isReadOnly(), 'layout');
            break; 
          } 
          case 'container': {  
            result.addIcon(icon, f.getType() === TopicLayoutFactory.Container.id && !this.isReadOnly(), 'layout'); 
            break;
          } 
          case 'row': {  
            result.addIcon(icon, f.getType() === TopicLayoutFactory.Row.id && !this.isReadOnly(), 'layout');
            break; 
          } 
          case 'column': {  
            result.addIcon(icon, f.getType() === TopicLayoutFactory.Column.id && !this.isReadOnly(), 'layout');
            break; 
          } 
          case 'title': {  
            result.addIcon(icon, f.getType() === TopicLayoutFactory.Title.id && !this.isReadOnly(), 'layout');
            break; 
          }
          case 'hr': {  
            result.addIcon(icon, f.getType() === TopicLayoutFactory.Hr.id && !this.isReadOnly(), 'layout');
            break; 
          } 
          default: {  
             break; 
          } 
       } 
      });
    }

    return result;
  }

  addControl(controlModel: ControlModel): Icon {
    const iconGroup = this.getOrBuildIconGroup();
    this.closeEditors();

    // Update model ...
    const model = this.getModel();
    model.addControl(controlModel);

    const result: Icon = TopicControlFactory.createIcon(this, controlModel, this.isReadOnly());
    iconGroup.addIcon(
      result,
      true,
      'control'
    );

    this.adjustShapes();
    return result;
  }

  findControlById(id: string) {
    const model = this.getModel();
    return model.findControlById(id);
  }

  /** */
  removeControl(controlModel: ControlModel): void {
    $assert(controlModel, 'controlModel could not be null');

    // Removing the icon from MODEL
    const model = this.getModel();
    model.removeControl(controlModel);

    // Removing the icon from UI
    const iconGroup = this.getIconGroup();
    if ($defined(iconGroup)) {
      iconGroup.removeIconByControlModel(controlModel);
    }
    this.adjustShapes();
  }

  addFeature(featureModel: FeatureModel): Icon {
    const iconGroup = this.getOrBuildIconGroup();
    this.closeEditors();

    // Update model ...
    const model = this.getModel();
    model.addFeature(featureModel);

    const result: Icon = TopicFeatureFactory.createIcon(this, featureModel, this.isReadOnly());
    iconGroup.addIcon(
      result,
      featureModel.getType() === TopicFeatureFactory.Icon.id && !this.isReadOnly(),
    );

    this.adjustShapes();
    return result;
  }

  findFeatureById(id: number) {
    const model = this.getModel();
    return model.findFeatureById(id);
  }

  /** */
  removeFeature(featureModel: FeatureModel): void {
    $assert(featureModel, 'featureModel could not be null');

    // Removing the icon from MODEL
    const model = this.getModel();
    model.removeFeature(featureModel);

    // Removing the icon from UI
    const iconGroup = this.getIconGroup();
    if ($defined(iconGroup)) {
      iconGroup.removeIconByModel(featureModel);
    }
    this.adjustShapes();
  }


  addLayout(layoutModel: LayoutModel): Icon {
    const iconGroup = this.getOrBuildIconGroup();
    this.closeEditors();

    // Update model ...
    const model = this.getModel();
    model.addLayout(layoutModel);

    const result: Icon = TopicLayoutFactory.createIcon(this, layoutModel, this.isReadOnly());
    iconGroup.addIcon(
      result,
      true,
      'layout'
    );

    this.adjustShapes();
    return result;
  }

  findLayoutById(id: string) {
    const model = this.getModel();
    return model.findLayoutById(id);
  }

  /** */
  removeLayout(layoutModel: LayoutModel): void {
    $assert(layoutModel, 'layoutModel could not be null');

    // Removing the icon from MODEL
    const model = this.getModel();
    model.removeLayout(layoutModel);

    // Removing the icon from UI
    const iconGroup = this.getIconGroup();
    if ($defined(iconGroup)) {
      iconGroup.removeIconByLayoutModel(layoutModel);
    }
    this.adjustShapes();
  }


  addRelationship(relationship: Relationship) {
    this._relationships.push(relationship);
  }

  deleteRelationship(relationship: Rect) {
    this._relationships = this._relationships.filter((r) => r !== relationship);
  }

  getRelationships(): Relationship[] {
    return this._relationships;
  }

  protected _buildTextShape(readOnly: boolean): Text {
    const result = new Text();
    const family = this.getFontFamily();
    const size = this.getFontSize();
    const weight = this.getFontWeight();
    const style = this.getFontStyle();
    result.setFont(family, size, style, weight);

    const color = this.getFontColor();
    result.setColor(color);

    if (!readOnly) {
      // Propagate mouse events ...
      if (!this.isCentralTopic()) {
        result.setCursor('move');
      } else {
        result.setCursor('default');
      }
    }

    return result;
  }

  /** */
  setFontFamily(value: string, updateModel?: boolean) {
    const textShape = this.getTextShape();
    textShape.setFontName(value);
    if ($defined(updateModel) && updateModel) {
      const model = this.getModel();
      model.setFontFamily(value);
    }
    this.adjustShapes();
  }

  setFontSize(value: number, updateModel?: boolean) {
    const textShape = this.getTextShape();
    textShape.setSize(value);

    if ($defined(updateModel) && updateModel) {
      const model = this.getModel();
      model.setFontSize(value);
    }
    this.adjustShapes();
  }

  setFontStyle(value: string, updateModel?: boolean) {
    const textShape = this.getTextShape();
    textShape.setStyle(value);
    if ($defined(updateModel) && updateModel) {
      const model = this.getModel();
      model.setFontStyle(value);
    }
    this.adjustShapes();
  }

  setFontWeight(value: string, updateModel?: boolean) {
    const textShape = this.getTextShape();
    textShape.setWeight(value);
    if ($defined(updateModel) && updateModel) {
      const model = this.getModel();
      model.setFontWeight(value);
    }
    this.adjustShapes();
  }

  getFontWeight() {
    const model = this.getModel();
    let result = model.getFontWeight();
    if (!$defined(result)) {
      const font = TopicStyle.defaultFontStyle(this);
      result = font.weight;
    }
    return result;
  }

  getFontFamily(): string {
    const model = this.getModel();
    let result = model.getFontFamily();
    if (!$defined(result)) {
      const font = TopicStyle.defaultFontStyle(this);
      result = font.font;
    }
    return result;
  }

  getFontColor(): string {
    const model = this.getModel();
    let result = model.getFontColor();
    if (!$defined(result)) {
      const font = TopicStyle.defaultFontStyle(this);
      result = font.color;
    }
    return result;
  }

  getFontStyle(): string {
    const model = this.getModel();
    let result = model.getFontStyle();
    if (!$defined(result)) {
      const font = TopicStyle.defaultFontStyle(this);
      result = font.style;
    }
    return result;
  }

  getFontSize(): number {
    const model = this.getModel();
    let result = model.getFontSize();
    if (!$defined(result)) {
      const font = TopicStyle.defaultFontStyle(this);
      result = font.size;
    }
    return result;
  }

  setFontColor(value: string, updateModel?: boolean) {
    const textShape = this.getTextShape();
    textShape.setColor(value);
    if ($defined(updateModel) && updateModel) {
      const model = this.getModel();
      model.setFontColor(value);
    }
  }

  private _setText(text: string, updateModel?: boolean) {
    const textShape = this.getTextShape();
    textShape.setText(text == null ? TopicStyle.defaultText(this) : text);

    if ($defined(updateModel) && updateModel) {
      const model = this.getModel();
      model.setText(text);
    }
  }

  setText(text: string) {
    // Avoid empty nodes ...
    if (!text || $.trim(text).length === 0) {
      this._setText(null, true);
    } else {
      this._setText(text, true);
    }

    this.adjustShapes();
  }

  getText(): string {
    const model = this.getModel();
    let result = model.getText();
    if (!$defined(result)) {
      result = TopicStyle.defaultText(this);
    }
    return result;
  }

  getVisible(): string {
    const model = this.getModel();
    let result = model.getVisible();
    if (!$defined(result)) {
      result = TopicStyle.defaultText(this);
    }
    return result;
  }

  setBackgroundColor(color: string) {
    this._setBackgroundColor(color, true);
  }

  private _setBackgroundColor(color: string, updateModel: boolean) {
    const innerShape = this.getInnerShape();
    innerShape.setFill(color);

    const connector = this.getShrinkConnector();
    if (connector) {
      connector.setFill(color);
    }

    if ($defined(updateModel) && updateModel) {
      const model = this.getModel();
      model.setBackgroundColor(color);
    }
  }

  /** */
  getBackgroundColor(): string {
    const model = this.getModel();
    let result = model.getBackgroundColor();
    if (!$defined(result)) {
      result = TopicStyle.defaultBackgroundColor(this);
    }
    return result;
  }

  /** */
  setBorderColor(color: string): void {
    this._setBorderColor(color, true);
  }

  private _setBorderColor(color: string, updateModel: boolean): void {
    const innerShape = this.getInnerShape();
    innerShape.setAttribute('strokeColor', color);

    const connector = this.getShrinkConnector();
    if (connector) {
      connector.setAttribute('strokeColor', color);
    }

    if ($defined(updateModel) && updateModel) {
      const model = this.getModel();
      model.setBorderColor(color);
    }
  }

  getBorderColor(): string {
    const model = this.getModel();
    let result = model.getBorderColor();
    if (!$defined(result)) {
      result = TopicStyle.defaultBorderColor(this);
    }
    return result;
  }

  _buildTopicShape(): ElementClass {
    const groupAttributes = {
      width: 100,
      height: 100,
      coordSizeWidth: 100,
      coordSizeHeight: 100,
    };
    const group = new Group(groupAttributes);
    this._set2DElement(group);

    // Shape must be build based on the model width ...
    const outerShape = this.getOuterShape();
    const innerShape = this.getInnerShape();
    const textShape = this.getTextShape();

    // Add to the group ...
    group.append(outerShape);
    group.append(innerShape);
    group.append(textShape);

    // Update figure size ...
    const model = this.getModel();
    if (model.getFeatures().length !== 0) {
      this.getOrBuildIconGroup();
    }

    const shrinkConnector = this.getShrinkConnector();
    if ($defined(shrinkConnector)) {
      shrinkConnector.addToWorkspace(group);
    }

    // Register listeners ...
    this._registerDefaultListenersToElement(group, this);

    // Set test id
    group.setTestId(model.getId());
  }

  _registerDefaultListenersToElement(elem: ElementClass, topic: Topic) {
    const mouseOver = function mouseOver() {
      if (topic.isMouseEventsEnabled()) {
        topic.handleMouseOver();
      }
    };
    elem.addEvent('mouseover', mouseOver);

    const outout = function outout() {
      if (topic.isMouseEventsEnabled()) {
        topic.handleMouseOut();
      }
    };
    elem.addEvent('mouseout', outout);

    const me = this;
    // Focus events ...
    elem.addEvent('mousedown', (event) => {
      const isMac = window.navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      if (!me.isReadOnly()) {
        // Disable topic selection of readOnly mode ...
        let value = true;
        if ((event.metaKey && isMac) || (event.ctrlKey && !isMac)) {
          value = !me.isOnFocus();
          event.stopPropagation();
          event.preventDefault();
        }
        topic.setOnFocus(value);
      }

      const eventDispatcher = me._getTopicEventDispatcher();
      eventDispatcher.process(TopicEvent.CLICK, me);
      event.stopPropagation();
    });
  }

  /** */
  areChildrenShrunken(): boolean {
    const model = this.getModel();
    return model.areChildrenShrunken() && !this.isCentralTopic();
  }

  isCollapsed(): boolean {
    let result = false;

    let current = this.getParent();
    while (current && !result) {
      result = current.areChildrenShrunken();
      current = current.getParent();
    }
    return result;
  }

  setChildrenShrunken(value: boolean) {
    // Update Model ...
    const model = this.getModel();
    model.setChildrenShrunken(value);

    // Change render base on the state.
    const shrinkConnector = this.getShrinkConnector();
    if (shrinkConnector) {
      shrinkConnector.changeRender(value);
    }

    // Do some fancy animation ....
    const elements = this._flatten2DElements(this);
    elements.forEach((elem) => {
      elem.setVisibility(!value, 250);
    });

    EventBus.instance.fireEvent('childShrinked', model);
  }

  getShrinkConnector(): ShirinkConnector | undefined {
    let result = this._connector;
    if (this._connector == null) {
      this._connector = new ShirinkConnector(this);
      this._connector.setVisibility(false);
      result = this._connector;
    }
    return result;
  }

  handleMouseOver(): void {
    const outerShape = this.getOuterShape();
    outerShape.setOpacity(1);
  }

  handleMouseOut(): void {
    const outerShape = this.getOuterShape();
    if (!this.isOnFocus()) {
      outerShape.setOpacity(0);
    }
  }

  showTextEditor(text: string) {
    this._getTopicEventDispatcher().show(this, {
      text,
    });
  }

  showNoteEditor(): void {
    const topicId = this.getId();
    const model = this.getModel();
    const editorModel = {
      getValue(): string {
        const notes = model.findFeatureByType(TopicFeatureFactory.Note.id);
        let result;
        if (notes.length > 0) {
          result = (notes[0] as NoteModel).getText();
        }

        return result;
      },

      setValue(value: string) {
        const dispatcher = ActionDispatcher.getInstance();
        const notes = model.findFeatureByType(TopicFeatureFactory.Note.id);
        if (!$defined(value)) {
          const featureId = notes[0].getId();
          dispatcher.removeFeatureFromTopic(topicId, featureId);
        } else if (notes.length > 0) {
          dispatcher.changeFeatureToTopic(topicId, notes[0].getId(), {
            text: value,
          });
        } else {
          dispatcher.addFeatureToTopic(topicId, TopicFeatureFactory.Note.id, {
            text: value,
          });
        }
      },
    };
    const editor = new NoteEditor(editorModel);
    this.closeEditors();
    editor.show();
  }

  /** opens a dialog where the user can enter or edit an existing link associated with this topic */
  showLinkEditor() {
    const topicId = this.getId();
    const model = this.getModel();
    const editorModel = {
      getValue(): string {
        // @param {mindplot.model.LinkModel[]} links
        const links = model.findFeatureByType(TopicFeatureFactory.Link.id);
        let result;
        if (links.length > 0) {
          result = (links[0] as LinkModel).getUrl();
        }

        return result;
      },

      setValue(value: string) {
        const dispatcher = ActionDispatcher.getInstance();
        const links = model.findFeatureByType(TopicFeatureFactory.Link.id);
        if (!$defined(value)) {
          const featureId = links[0].getId();
          dispatcher.removeFeatureFromTopic(topicId, featureId);
        } else if (links.length > 0) {
          dispatcher.changeFeatureToTopic(topicId, links[0].getId(), {
            url: value,
          });
        } else {
          dispatcher.addFeatureToTopic(topicId, TopicFeatureFactory.Link.id, {
            url: value,
          });
        }
      },
    };

    this.closeEditors();
    const editor = new LinkEditor(editorModel);
    editor.show();
  }

  showPropertiesEditor(type?: string): void {
    const topicId = this.getId();
    const model = this.getModel();
    if (model.getControls().length > 0) {
      type = model.getControls()[0].getType();
    }
    const editorModel = {
      getKey(): string {
        let properties;
        properties = model.findControlByType(type);
        if(type === TopicControlFactory.Textfield.id) {
          return result['key'] = (properties[0] as TextfieldModel).getKey();
        } else if(type === TopicControlFactory.Textarea.id) {
          return result['key'] = (properties[0] as TextareaModel).getKey();
        } else if(type === TopicControlFactory.Select.id) {
          return result['key'] = (properties[0] as SelectModel).getKey();
        } else if(type === TopicControlFactory.Option.id) {
          return result['key'] = (properties[0] as OptionModel).getKey();
        } else if(type === TopicControlFactory.Radiogroup.id) {
          return result['key'] = (properties[0] as RadiogroupModel).getKey();
        } else if(type === TopicControlFactory.Radio.id) {
          return result['key'] = (properties[0] as RadioModel).getKey();
        } else if(type === TopicControlFactory.Checkbox.id) {
          return result['key'] = (properties[0] as CheckboxModel).getKey();
        }
      },

      setKey(value: string) {
        const dispatcher = ActionDispatcher.getInstance();
        const properties = model.findControlByType(type);
        if(type === TopicControlFactory.Textfield.id) {
          const controls = model.findControlByType(TopicControlFactory.Textfield.id);
          if (controls.length > 0) {
            dispatcher.changeControlToTopic(topicId, controls[0].getId(), {
              key: value,
            });
          } else {
            dispatcher.addControlToTopic(topicId, TopicControlFactory.Textfield.id, {
              key: value,
            });
          }
          (properties[0] as TextfieldModel).setKey(value);
        } else if(type === TopicControlFactory.Textarea.id) {
          const controls = model.findControlByType(TopicControlFactory.Textarea.id);
          if (controls.length > 0) {
            dispatcher.changeControlToTopic(topicId, controls[0].getId(), {
              key: value,
            });
          } else {
            dispatcher.addControlToTopic(topicId, TopicControlFactory.Textarea.id, {
              key: value,
            });
          }
          (properties[0] as TextareaModel).setKey(value);
        } else if(type === TopicControlFactory.Select.id) {
          const controls = model.findControlByType(TopicControlFactory.Select.id);
          if (controls.length > 0) {
            dispatcher.changeControlToTopic(topicId, controls[0].getId(), {
              key: value,
            });
          } else {
            dispatcher.addControlToTopic(topicId, TopicControlFactory.Select.id, {
              key: value,
            });
          }
          (properties[0] as SelectModel).setKey(value);
        } else if(type === TopicControlFactory.Option.id) {
          const controls = model.findControlByType(TopicControlFactory.Option.id);
          if (controls.length > 0) {
            dispatcher.changeControlToTopic(topicId, controls[0].getId(), {
              key: value,
            });
          } else {
            dispatcher.addControlToTopic(topicId, TopicControlFactory.Option.id, {
              key: value,
            });
          }
          (properties[0] as OptionModel).setKey(value);
        } else if(type === TopicControlFactory.Radiogroup.id) {
          const controls = model.findControlByType(TopicControlFactory.Radiogroup.id);
          if (controls.length > 0) {
            dispatcher.changeControlToTopic(topicId, controls[0].getId(), {
              key: value,
            });
          } else {
            dispatcher.addControlToTopic(topicId, TopicControlFactory.Radiogroup.id, {
              key: value,
            });
          }
          (properties[0] as RadiogroupModel).setKey(value);
        } else if(type === TopicControlFactory.Radio.id) {
          const controls = model.findControlByType(TopicControlFactory.Radio.id);
          if (controls.length > 0) {
            dispatcher.changeControlToTopic(topicId, controls[0].getId(), {
              key: value,
            });
          } else {
            dispatcher.addControlToTopic(topicId, TopicControlFactory.Radio.id, {
              key: value,
            });
          }
          (properties[0] as RadioModel).setKey(value);
        } else if(type === TopicControlFactory.Checkbox.id) {
          const controls = model.findControlByType(TopicControlFactory.Checkbox.id);
          if (controls.length > 0) {
            dispatcher.changeControlToTopic(topicId, controls[0].getId(), {
              key: value,
            });
          } else {
            dispatcher.addControlToTopic(topicId, TopicControlFactory.Checkbox.id, {
              key: value,
            });
          }
          (properties[0] as CheckboxModel).setKey(value);
        } else if(type === TopicControlFactory.Calendar.id) {
          const controls = model.findControlByType(TopicControlFactory.Calendar.id);
          if (controls.length > 0) {
            dispatcher.changeControlToTopic(topicId, controls[0].getId(), {
              key: value,
            });
          } else {
            dispatcher.addControlToTopic(topicId, TopicControlFactory.Calendar.id, {
              key: value,
            });
          }
          (properties[0] as CalendarModel).setKey(value);
        } else if(type === TopicControlFactory.Editor.id) {
          const controls = model.findControlByType(TopicControlFactory.Editor.id);
          if (controls.length > 0) {
            dispatcher.changeControlToTopic(topicId, controls[0].getId(), {
              key: value,
            });
          } else {
            dispatcher.addControlToTopic(topicId, TopicControlFactory.Editor.id, {
              key: value,
            });
          }
          (properties[0] as EditorModel).setKey(value);
        } else if(type === TopicControlFactory.Time.id) {
          const controls = model.findControlByType(TopicControlFactory.Time.id);
          if (controls.length > 0) {
            dispatcher.changeControlToTopic(topicId, controls[0].getId(), {
              key: value,
            });
          } else {
            dispatcher.addControlToTopic(topicId, TopicControlFactory.Time.id, {
              key: value,
            });
          }
          (properties[0] as TimeModel).setKey(value);
        } else if(type === TopicControlFactory.Time.id) {
          const controls = model.findControlByType(TopicControlFactory.Address.id);
          if (controls.length > 0) {
            dispatcher.changeControlToTopic(topicId, controls[0].getId(), {
              key: value,
            });
          } else {
            dispatcher.addControlToTopic(topicId, TopicControlFactory.Address.id, {
              key: value,
            });
          }
          (properties[0] as AddressModel).setKey(value);
        } else if(type === TopicControlFactory.Keywords.id) {
          const controls = model.findControlByType(TopicControlFactory.Keywords.id);
          if (controls.length > 0) {
            dispatcher.changeControlToTopic(topicId, controls[0].getId(), {
              key: value,
            });
          } else {
            dispatcher.addControlToTopic(topicId, TopicControlFactory.Keywords.id, {
              key: value,
            });
          }
          (properties[0] as KeywordsModel).setKey(value);
        } else if(type === TopicControlFactory.Keywords.id) {
          const controls = model.findControlByType(TopicControlFactory.Keywords.id);
          if (controls.length > 0) {
            dispatcher.changeControlToTopic(topicId, controls[0].getId(), {
              key: value,
            });
          } else {
            dispatcher.addControlToTopic(topicId, TopicControlFactory.Keywords.id, {
              key: value,
            });
          }
          (properties[0] as KeywordsModel).setKey(value);
        } else if(type === TopicControlFactory.Ratings.id) {
          const controls = model.findControlByType(TopicControlFactory.Ratings.id);
          if (controls.length > 0) {
            dispatcher.changeControlToTopic(topicId, controls[0].getId(), {
              key: value,
            });
          } else {
            dispatcher.addControlToTopic(topicId, TopicControlFactory.Ratings.id, {
              key: value,
            });
          }
          (properties[0] as RatingsModel).setKey(value);
        }
      },

      setRequired(value: boolean) {
        const dispatcher = ActionDispatcher.getInstance();
        const properties = model.findControlByType(type);
        let val_string = 'false';
        if(value) {
          val_string = 'true';
        }
        if(type === TopicControlFactory.Textfield.id) {
          const controls = model.findControlByType(TopicControlFactory.Textfield.id);
          if (controls.length > 0) {
            dispatcher.changeControlToTopic(topicId, controls[0].getId(), {
              required: value,
            });
          } else {
            dispatcher.addControlToTopic(topicId, TopicControlFactory.Textfield.id, {
              required: value,
            });
          }
          (properties[0] as TextfieldModel).setRequired(value);
        } else if(type === TopicControlFactory.Textarea.id) {
          const controls = model.findControlByType(TopicControlFactory.Textarea.id);
          if (controls.length > 0) {
            dispatcher.changeControlToTopic(topicId, controls[0].getId(), {
              required: value,
            });
          } else {
            dispatcher.addControlToTopic(topicId, TopicControlFactory.Textarea.id, {
              required: value,
            });
          }
          (properties[0] as TextareaModel).setRequired(value);
        } else if(type === TopicControlFactory.Select.id) {
          const controls = model.findControlByType(TopicControlFactory.Select.id);
          if (controls.length > 0) {
            dispatcher.changeControlToTopic(topicId, controls[0].getId(), {
              required: value,
            });
          } else {
            dispatcher.addControlToTopic(topicId, TopicControlFactory.Select.id, {
              required: value,
            });
          }
          (properties[0] as SelectModel).setRequired(value);
        } else if(type === TopicControlFactory.Option.id) {
          const controls = model.findControlByType(TopicControlFactory.Option.id);
          if (controls.length > 0) {
            dispatcher.changeControlToTopic(topicId, controls[0].getId(), {
              required: value,
            });
          } else {
            dispatcher.addControlToTopic(topicId, TopicControlFactory.Option.id, {
              required: value,
            });
          }
          (properties[0] as OptionModel).setRequired(value);
        } else if(type === TopicControlFactory.Radiogroup.id) {
          const controls = model.findControlByType(TopicControlFactory.Radiogroup.id);
          if (controls.length > 0) {
            dispatcher.changeControlToTopic(topicId, controls[0].getId(), {
              required: value,
            });
          } else {
            dispatcher.addControlToTopic(topicId, TopicControlFactory.Radiogroup.id, {
              required: value,
            });
          }
          (properties[0] as RadiogroupModel).setRequired(value);
        } else if(type === TopicControlFactory.Radio.id) {
          const controls = model.findControlByType(TopicControlFactory.Radio.id);
          if (controls.length > 0) {
            dispatcher.changeControlToTopic(topicId, controls[0].getId(), {
              required: value,
            });
          } else {
            dispatcher.addControlToTopic(topicId, TopicControlFactory.Radio.id, {
              required: value,
            });
          }
          (properties[0] as RadioModel).setRequired(value);
        } else if(type === TopicControlFactory.Checkbox.id) {
          const controls = model.findControlByType(TopicControlFactory.Checkbox.id);
          if (controls.length > 0) {
            dispatcher.changeControlToTopic(topicId, controls[0].getId(), {
              required: value,
            });
          } else {
            dispatcher.addControlToTopic(topicId, TopicControlFactory.Checkbox.id, {
              required: value,
            });
          }
          (properties[0] as CheckboxModel).setRequired(value);
        }
      },

      getRequired(): boolean {
        let properties;
        properties = model.findControlByType(type);
        if(type === TopicControlFactory.Textfield.id) {
          return result['required'] = (properties[0] as TextfieldModel).getRequired();
        } else if(type === TopicControlFactory.Textarea.id) {
          return result['required'] = (properties[0] as TextareaModel).getRequired();
        } else if(type === TopicControlFactory.Select.id) {
          return result['required'] = (properties[0] as SelectModel).getRequired();
        } else if(type === TopicControlFactory.Option.id) {
          return result['required'] = (properties[0] as OptionModel).getRequired();
        } else if(type === TopicControlFactory.Radiogroup.id) {
          return result['required'] = (properties[0] as RadiogroupModel).getRequired();
        } else if(type === TopicControlFactory.Radio.id) {
          return result['required'] = (properties[0] as RadioModel).getRequired();
        } else if(type === TopicControlFactory.Checkbox.id) {
          return result['required'] = (properties[0] as CheckboxModel).getRequired();
        } else if(type === TopicControlFactory.Checkbox.id) {
          return result['required'] = (properties[0] as CalendarModel).getRequired();
        } else if(type === TopicControlFactory.Checkbox.id) {
          return result['required'] = (properties[0] as EditorModel).getRequired();
        } else if(type === TopicControlFactory.Checkbox.id) {
          return result['required'] = (properties[0] as TimeModel).getRequired();
        } else if(type === TopicControlFactory.Checkbox.id) {
          return result['required'] = (properties[0] as AddressModel).getRequired();
        } else if(type === TopicControlFactory.Checkbox.id) {
          return result['required'] = (properties[0] as KeywordsModel).getRequired();
        } else if(type === TopicControlFactory.Checkbox.id) {
          return result['required'] = (properties[0] as RatingsModel).getRequired();
        }
      }
    };
    const editor = new PropertiesEditor(editorModel);
    this.closeEditors();
    editor.show();
  }

  closeEditors() {
    this._getTopicEventDispatcher().close(true);
  }

  private _getTopicEventDispatcher() {
    return TopicEventDispatcher.getInstance();
  }

  /**
     * Point: references the center of the rect shape.!!!
     */
  setPosition(point: Point) {
    $assert(point, 'position can not be null');
    // allowed param reassign to avoid risks of existing code relying in this side-effect
    // eslint-disable-next-line no-param-reassign
    point.x = Math.ceil(point.x);
    // eslint-disable-next-line no-param-reassign
    point.y = Math.ceil(point.y);

    // Update model's position ...
    const model = this.getModel();
    model.setPosition(point.x, point.y);

    // Elements are positioned in the center.
    // All topic element must be positioned based on the innerShape.
    const size = this.getSize();

    const cx = point.x - size.width / 2;
    const cy = point.y - size.height / 2;

    // Update visual position.
    this.get2DElement().setPosition(cx, cy);

    // Update connection lines ...
    this._updateConnectionLines();

    // Check object state.
    this.invariant();
  }

  /** */
  getOutgoingLine(): Line {
    return this._outgoingLine;
  }

  getIncomingLines() {
    const children = this.getChildren();
    return children
      .filter((node) => $defined(node.getOutgoingLine()))
      .map((node) => node.getOutgoingLine());
  }

  getOutgoingConnectedTopic(): Topic {
    let result = null;
    const line = this.getOutgoingLine();
    if ($defined(line)) {
      result = line.getTargetTopic();
    }
    return result;
  }

  private _updateConnectionLines(): void {
    // Update this to parent line ...
    const outgoingLine = this.getOutgoingLine();
    if ($defined(outgoingLine)) {
      outgoingLine.redraw();
    }

    // Update all the incoming lines ...
    const incomingLines = this.getIncomingLines();
    incomingLines.forEach((line) => line.redraw());

    // Update relationship lines
    this._relationships.forEach((r) => r.redraw());
  }

  setBranchVisibility(value: boolean): void {
    let current: Topic = this;
    let parent: Topic = this;
    while (parent != null && !parent.isCentralTopic()) {
      current = parent;
      parent = current.getParent();
    }
    current.setVisibility(value);
  }

  setVisibility(value: boolean, fade = 0): void {
    this._setTopicVisibility(value, fade);

    // Hide all children...
    this._setChildrenVisibility(value, fade);

    // If there there are connection to the node, topic must be hidden.
    this._setRelationshipLinesVisibility(value, fade);

    // If it's connected, the connection must be rendered.
    const outgoingLine = this.getOutgoingLine();
    if (outgoingLine) {
      outgoingLine.setVisibility(value, fade);
    }
  }

  /** */
  moveToBack(): void {
    // Update relationship lines
    this._relationships.forEach((r) => r.moveToBack());

    const connector = this.getShrinkConnector();
    if ($defined(connector)) {
      connector.moveToBack();
    }

    this.get2DElement().moveToBack();
  }

  /** */
  moveToFront(): void {
    this.get2DElement().moveToFront();
    const connector = this.getShrinkConnector();
    if ($defined(connector)) {
      connector.moveToFront();
    }
    // Update relationship lines
    this._relationships.forEach((r) => r.moveToFront());
  }

  /** */
  isVisible(): boolean {
    const elem = this.get2DElement();
    return elem.isVisible();
  }

  private _setRelationshipLinesVisibility(value: boolean, fade = 0): void {
    this._relationships.forEach((relationship) => {
      const sourceTopic = relationship.getSourceTopic();
      const targetTopic = relationship.getTargetTopic();

      const targetParent = targetTopic.getModel().getParent();
      const sourceParent = sourceTopic.getModel().getParent();
      relationship.setVisibility(
        value
        && (targetParent == null || !targetParent.areChildrenShrunken())
        && (sourceParent == null || !sourceParent.areChildrenShrunken()),
        fade,
      );
    });
  }

  private _setTopicVisibility(value: boolean, fade = 0) {
    const elem = this.get2DElement();
    elem.setVisibility(value, fade);

    if (this.getIncomingLines().length > 0) {
      const connector = this.getShrinkConnector();
      if ($defined(connector)) {
        connector.setVisibility(value, fade);
      }
    }

    // Hide inner shape ...
    this.getInnerShape().setVisibility(value, fade);

    // Hide text shape ...
    const textShape = this.getTextShape();
    textShape.setVisibility(this.getShapeType() !== TopicShape.IMAGE ? value : false, fade);
  }

  /** */
  setOpacity(opacity: number): void {
    const elem = this.get2DElement();
    elem.setOpacity(opacity);

    const connector = this.getShrinkConnector();
    if ($defined(connector)) {
      connector.setOpacity(opacity);
    }
    const textShape = this.getTextShape();
    textShape.setOpacity(opacity);
  }

  private _setChildrenVisibility(value: boolean, fade = 0) {
    // Hide all children.
    const children = this.getChildren();
    const model = this.getModel();

    const visibility = value ? !model.areChildrenShrunken() : value;
    children.forEach((child) => {
      child.setVisibility(visibility, fade);
      const outgoingLine = child.getOutgoingLine();
      outgoingLine.setVisibility(visibility);
    });
  }

  /** */
  invariant() {
    const line = this._outgoingLine;
    const model = this.getModel();
    const isConnected = model.isConnected();

    // Check consistency...
    if ((isConnected && !line) || (!isConnected && line)) {
      // $assert(false,'Illegal state exception.');
    }
  }

  setSize(size: SizeType, force?: boolean): void {
    $assert(size, 'size can not be null');
    $assert($defined(size.width), 'size seem not to be a valid element');
    const roundedSize = {
      width: Math.ceil(size.width),
      height: Math.ceil(size.height),
    };

    const oldSize = this.getSize();
    const hasSizeChanged = oldSize.width !== roundedSize.width || oldSize.height !== roundedSize.height;
    if (hasSizeChanged || force) {
      NodeGraph.prototype.setSize.call(this, roundedSize);

      const outerShape = this.getOuterShape();
      const innerShape = this.getInnerShape();

      outerShape.setSize(roundedSize.width + 4, roundedSize.height + 6);
      innerShape.setSize(roundedSize.width, roundedSize.height);

      // Update the figure position(ej: central topic must be centered) and children position.
      this._updatePositionOnChangeSize(oldSize, roundedSize);

      if (hasSizeChanged) {
        EventBus.instance.fireEvent('topicResize', {
          node: this.getModel(),
          size: roundedSize,
        });
      }
    }
  }

  protected abstract _updatePositionOnChangeSize(oldSize: SizeType, roundedSize: SizeType): void;

  disconnect(workspace: Workspace): void {
    const outgoingLine = this.getOutgoingLine();
    if ($defined(outgoingLine)) {
      $assert(workspace, 'workspace can not be null');

      this._outgoingLine = null;

      // Disconnect nodes ...
      const targetTopic = outgoingLine.getTargetTopic();
      targetTopic.removeChild(this);

      // Update model ...
      const childModel = this.getModel();
      childModel.disconnect();

      this._parent = null;

      // Remove graphical element from the workspace...
      outgoingLine.removeFromWorkspace(workspace);

      // Remove from workspace.
      EventBus.instance.fireEvent('topicDisconect', this.getModel());

      // Change text based on the current connection ...
      const model = this.getModel();
      if (!model.getText()) {
        const text = this.getText();
        this._setText(text, false);
      }
      if (!model.getFontSize()) {
        const size = this.getFontSize();
        this.setFontSize(size, false);
      }

      // Hide connection line?.
      if (targetTopic.getChildren().length === 0) {
        const connector = targetTopic.getShrinkConnector();
        if ($defined(connector)) {
          connector.setVisibility(false);
          targetTopic.isCollapsed(false);
        }
      }
    }
  }

  getOrder(): number {
    const model = this.getModel();
    return model.getOrder();
  }

  /** */
  setOrder(value: number) {
    const model = this.getModel();
    model.setOrder(value);
  }

  /** */
  connectTo(targetTopic: Topic, workspace: Workspace) {
    $assert(!this._outgoingLine, 'Could not connect an already connected node');
    $assert(targetTopic !== this, 'Circular connection are not allowed');
    $assert(targetTopic, 'Parent Graph can not be null');
    $assert(workspace, 'Workspace can not be null');

    // Connect Graphical Nodes ...
    targetTopic.append(this);
    this._parent = targetTopic;

    // Update model ...
    const targetModel = targetTopic.getModel();
    const childModel = this.getModel();
    childModel.connectTo(targetModel);

    // Create a connection line ...
    const outgoingLine = new ConnectionLine(this, targetTopic);
    outgoingLine.setVisibility(false);

    this._outgoingLine = outgoingLine;
    workspace.append(outgoingLine);

    // Update figure is necessary.
    this.updateTopicShape(targetTopic);

    // Change text based on the current connection ...
    const model = this.getModel();
    if (!model.getText()) {
      const text = this.getText();
      this._setText(text, false);
    }
    if (!model.getFontSize()) {
      const size = this.getFontSize();
      this.setFontSize(size, false);
    }
    this.getTextShape();

    // Display connection node...
    const connector = targetTopic.getShrinkConnector();
    if ($defined(connector)) {
      connector.setVisibility(true);
    }

    // Redraw line ...
    outgoingLine.redraw();

    // Fire connection event ...
    if (this.isInWorkspace()) {
      EventBus.instance.fireEvent('topicConnected', {
        parentNode: targetTopic.getModel(),
        childNode: this.getModel(),
      });
    }
  }

  abstract updateTopicShape(targetTopic: Topic);

  append(child: Topic) {
    const children = this.getChildren();
    children.push(child);
  }

  /** */
  removeChild(child: Topic) {
    const children = this.getChildren();
    this._children = children.filter((c) => c !== child);
  }

  /** */
  getChildren(): Topic[] {
    let result = this._children;
    if (!$defined(result)) {
      this._children = [];
      result = this._children;
    }
    return result;
  }

  removeFromWorkspace(workspace: Workspace) {
    const elem2d = this.get2DElement();
    workspace.removeChild(elem2d);
    const line = this.getOutgoingLine();
    if ($defined(line)) {
      workspace.removeChild(line);
    }
    this._isInWorkspace = false;
    EventBus.instance.fireEvent('topicRemoved', this.getModel());
  }

  addToWorkspace(workspace: Workspace) {
    const elem = this.get2DElement();
    workspace.append(elem);
    if (!this.isInWorkspace()) {
      if (!this.isCentralTopic()) {
        EventBus.instance.fireEvent('topicAdded', this.getModel());
      }

      if (this.getModel().isConnected()) {
        EventBus.instance.fireEvent('topicConnected', {
          parentNode: this.getOutgoingConnectedTopic().getModel(),
          childNode: this.getModel(),
        });
      }
    }
    this._isInWorkspace = true;
    this.adjustShapes();
  }

  /** */
  isInWorkspace(): boolean {
    return this._isInWorkspace;
  }

  /** */
  createDragNode(layoutManager: LayoutManager) {
    const result = super.createDragNode(layoutManager);

    // Is the node already connected ?
    const targetTopic = this.getOutgoingConnectedTopic();
    if ($defined(targetTopic)) {
      result.connectTo(targetTopic);
      result.setVisibility(false);
    }

    // If a drag node is create for it, let's hide the editor.
    this._getTopicEventDispatcher().close(false);

    return result;
  }

  adjustShapes(): void {
    if (this._isInWorkspace) {
      const textShape = this.getTextShape();
      if (this.getShapeType() !== TopicShape.IMAGE) {
        // Calculate topic size and adjust elements ...
        const textWidth = textShape.getWidth();
        const textHeight = textShape.getHeight();
        const padding = TopicStyle.getInnerPadding(this);

        // Adjust icons group based on the font size ...
        const iconGroup = this.getOrBuildIconGroup();
        const fontHeight = this.getTextShape().getFontHeight();
        const iconHeight = ICON_SCALING_FACTOR * fontHeight;
        iconGroup.seIconSize(iconHeight, iconHeight);

        // Calculate size and adjust ...
        const topicHeight = Math.max(iconHeight, textHeight) + padding * 2;
        const textIconSpacing = Math.round(fontHeight / 4);
        const iconGroupWith = iconGroup.getSize().width;
        const topicWith = iconGroupWith + 2 * textIconSpacing + textWidth + padding * 2;

        this.setSize({
          width: topicWith,
          height: topicHeight,
        }, false);

        // Adjust all topic elements positions ...
        const yPosition = Math.round((topicHeight - textHeight) / 2);
        iconGroup.setPosition(padding, yPosition);
        textShape.setPosition(padding + iconGroupWith + textIconSpacing, yPosition);
      } else {
        // In case of images, the size is fixed ...
        const size = this.getModel().getImageSize();
        this.setSize(size, false);
      }
    }
  }

  private _flatten2DElements(topic: Topic): (Topic | Relationship)[] {
    let result = [];

    const children = topic.getChildren();
    children.forEach((child) => {
      result.push(child);
      result.push(child.getOutgoingLine());

      const relationships = child.getRelationships();
      result = result.concat(relationships);

      if (!child.areChildrenShrunken()) {
        const innerChilds = this._flatten2DElements(child);
        result = result.concat(innerChilds);
      }
    });
    return result;
  }

  abstract workoutOutgoingConnectionPoint(position: Point): Point;

  abstract workoutIncomingConnectionPoint(position: Point): Point;

  isChildTopic(childTopic: Topic): boolean {
    let result = this.getId() === childTopic.getId();
    if (!result) {
      const children = this.getChildren();
      for (let i = 0; i < children.length; i++) {
        const parent = children[i];
        result = parent.isChildTopic(childTopic);
        if (result) {
          break;
        }
      }
    }
    return result;
  }

  isCentralTopic(): boolean {
    return this.getModel().getType() === 'CentralTopic';
  }
}

export default Topic;
