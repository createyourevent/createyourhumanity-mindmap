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
import { $defined, $assert } from '@wisemapping/core-js';
import { Point } from '@wisemapping/web2d';
import ActionDispatcher from './ActionDispatcher';
import DesignerActionRunner from './DesignerActionRunner';
import AddTopicCommand from './commands/AddTopicCommand';
import AddRelationshipCommand from './commands/AddRelationshipCommand';
import AddFeatureToTopicCommand from './commands/AddFeatureToTopicCommand';
import DeleteCommand from './commands/DeleteCommand';
import RemoveFeatureFromTopicCommand from './commands/RemoveFeatureFromTopicCommand';
import DragTopicCommand from './commands/DragTopicCommand';
import GenericFunctionCommand from './commands/GenericFunctionCommand';
import MoveControlPointCommand from './commands/MoveControlPointCommand';
import ChangeFeatureToTopicCommand from './commands/ChangeFeatureToTopicCommand';
import EventBus from './layout/EventBus';
import CommandContext from './CommandContext';
import NodeModel from './model/NodeModel';
import RelationshipModel from './model/RelationshipModel';
import Topic from './Topic';
import Command from './Command';
import FeatureType from './model/FeatureType';
import ChangeControlToTopicCommand from './commands/ChangeControlToTopicCommand';
import AddControlToTopicCommand from './commands/AddControlToTopicCommand';
import RemoveControlFromTopicCommand from './commands/RemoveControlFromTopicCommand';
import ControlType from './model/ControlType';
import LayoutType from './model/LayoutType';
import AddLayoutToTopicCommand from './commands/AddLayoutToTopicCommand';
import ChangeLayoutToTopicCommand from './commands/ChangeLayoutToTopicCommand';
import RemoveLayoutFromTopicCommand from './commands/RemoveLayoutFromTopicCommand';
import RemoveGoToLinkFromTopicCommand from './commands/RemoveGoToLinkFromTopicCommand';

class StandaloneActionDispatcher extends ActionDispatcher {
  
  private _actionRunner: DesignerActionRunner;

  public get actionRunner(): DesignerActionRunner {
    return this._actionRunner;
  }

  public set actionRunner(value: DesignerActionRunner) {
    this._actionRunner = value;
  }

  constructor(commandContext: CommandContext) {
    super(commandContext);
    this._actionRunner = new DesignerActionRunner(commandContext, this);
  }

  addTopics(models: NodeModel[], parentTopicsId: number[] = undefined) {
    const command = new AddTopicCommand(models, parentTopicsId);
    this.execute(command);
  }

  addRelationship(model: RelationshipModel) {
    const command = new AddRelationshipCommand(model);
    this.execute(command);
  }

  /** */
  deleteEntities(topicsIds: number[], relIds: number[]) {
    const command = new DeleteCommand(topicsIds, relIds);
    this.execute(command);
  }

  /** */
  dragTopic(topicId: number, position: Point, order: number, parentTopic: Topic) {
    const command = new DragTopicCommand(topicId, position, order, parentTopic);
    this.execute(command);
  }

  /** */
  moveTopic(topicId: number, position: Point) {
    $assert($defined(topicId), 'topicsId can not be null');
    $assert($defined(position), 'position can not be null');

    const commandFunc = (topic: Topic, pos: Point) => {
      const result = topic.getPosition();
      EventBus.instance.fireEvent('topicMoved', {
        node: topic.getModel(),
        position: pos,
      });
      return result;
    };

    const command = new GenericFunctionCommand(commandFunc, [topicId], position);
    this.execute(command);
  }

  /** */
  moveControlPoint(ctrlPoint: Point, point: Point) {
    const command = new MoveControlPointCommand(ctrlPoint, point);
    this.execute(command);
  }

  /** */
  changeFontStyleToTopic(topicsIds: number[]) {
    const commandFunc = (topic: Topic) => {
      const result = topic.getFontStyle();
      const style = result === 'italic' ? 'normal' : 'italic';
      topic.setFontStyle(style, true);
      return result;
    };
    const command = new GenericFunctionCommand(commandFunc, topicsIds);
    this.execute(command);
  }

  changeTextToTopic(topicsIds: number[], text: string): void {
    $assert($defined(topicsIds), 'topicsIds can not be null');

    const commandFunc = (topic: Topic, value: string) => {
      const result = topic.getText();
      topic.setText(value);
      return result;
    };
    commandFunc.commandType = 'changeTextToTopic';

    const command = new GenericFunctionCommand(commandFunc, topicsIds, text);
    this.execute(command);
  }

  /** */
  changeFontFamilyToTopic(topicIds: number[], fontFamily: string) {
    $assert(topicIds, 'topicIds can not be null');
    $assert(fontFamily, 'fontFamily can not be null');

    const commandFunc = (topic: Topic, commandFontFamily: string) => {
      const result = topic.getFontFamily();
      topic.setFontFamily(commandFontFamily, true);

      topic.adjustShapes();
      return result;
    };

    const command = new GenericFunctionCommand(commandFunc, topicIds, fontFamily);
    this.execute(command);
  }

  /** */
  changeFontColorToTopic(topicsIds: number[], color: string) {
    $assert(topicsIds, 'topicIds can not be null');
    $assert(color, 'color can not be null');

    const commandFunc = (topic: Topic, commandColor: string) => {
      const result = topic.getFontColor();
      topic.setFontColor(commandColor, true);
      return result;
    };

    const command = new GenericFunctionCommand(commandFunc, topicsIds, color);
    command.discardDuplicated = 'fontColorCommandId';
    this.execute(command);
  }

  /** */
  changeBackgroundColorToTopic(topicsIds: number[], color: string) {
    $assert(topicsIds, 'topicIds can not be null');
    $assert(color, 'color can not be null');

    const commandFunc = (topic: Topic, commandColor: string) => {
      const result = topic.getBackgroundColor();
      topic.setBackgroundColor(commandColor);
      return result;
    };

    const command = new GenericFunctionCommand(commandFunc, topicsIds, color);
    command.discardDuplicated = 'backColor';
    this.execute(command);
  }

  /** */
  changeBorderColorToTopic(topicsIds: number[], color: string): void {
    $assert(topicsIds, 'topicIds can not be null');
    $assert(color, 'topicIds can not be null');

    const commandFunc = (topic: Topic, commandColor: string) => {
      const result = topic.getBorderColor();
      topic.setBorderColor(commandColor);
      return result;
    };

    const command = new GenericFunctionCommand(commandFunc, topicsIds, color);
    command.discardDuplicated = 'borderColorCommandId';
    this.execute(command);
  }

  /** */
  changeFontSizeToTopic(topicsIds: number[], size: number) {
    $assert(topicsIds, 'topicIds can not be null');
    $assert(size, 'size can not be null');

    const commandFunc = (topic: Topic, commandSize: number) => {
      const result = topic.getFontSize();
      topic.setFontSize(commandSize, true);

      topic.adjustShapes();
      return result;
    };

    const command = new GenericFunctionCommand(commandFunc, topicsIds, size);
    this.execute(command);
  }

  /** */
  changeShapeTypeToTopic(topicsIds: number[], shapeType: string) {
    $assert(topicsIds, 'topicsIds can not be null');
    $assert(shapeType, 'shapeType can not be null');

    const commandFunc = (topic: Topic, commandShapeType: string) => {
      const result = topic.getShapeType();
      topic.setShapeType(commandShapeType);
      return result;
    };

    const command = new GenericFunctionCommand(commandFunc, topicsIds, shapeType);
    this.execute(command);
  }

  /** */
  changeFontWeightToTopic(topicsIds: number[]) {
    $assert(topicsIds, 'topicsIds can not be null');

    const commandFunc = (topic: Topic) => {
      const result = topic.getFontWeight();
      const weight = result === 'bold' ? 'normal' : 'bold';
      topic.setFontWeight(weight, true);

      topic.adjustShapes();
      return result;
    };

    const command = new GenericFunctionCommand(commandFunc, topicsIds);
    this.execute(command);
  }

  /** */
  shrinkBranch(topicsIds: number[], collapse: boolean) {
    $assert(topicsIds, 'topicsIds can not be null');

    const commandFunc = (topic: Topic, isShrink: boolean) => {
      topic.setChildrenShrunken(isShrink);
      return !isShrink;
    };

    const command = new GenericFunctionCommand(commandFunc, topicsIds, collapse);
    this.execute(command);
  }


  addFeatureToTopic(topicId: number, featureType: FeatureType, attributes) {
    const command = new AddFeatureToTopicCommand(topicId, featureType, attributes);
    this.execute(command);
  }

  addControlToTopic(topicId: number, controlType: ControlType, attributes) {
    const command = new AddControlToTopicCommand(topicId, controlType, attributes);
    this.execute(command);
  }

  addLayoutToTopic(topicId: number, layoutType: LayoutType, attributes) {
    const command = new AddLayoutToTopicCommand(topicId, layoutType, attributes);
    this.execute(command);
  }

  /** */
  changeFeatureToTopic(topicId: number, featureId: number, attributes) {
    const command = new ChangeFeatureToTopicCommand(topicId, featureId, attributes);
    this.execute(command);
  }

  /** */
  changeControlToTopic(topicId: number, featureId: string, attributes) {
    const command = new ChangeControlToTopicCommand(topicId, featureId, attributes);
    this.execute(command);
  }

    /** */
    changeLayoutToTopic(topicId: number, featureId: string, attributes) {
      const command = new ChangeLayoutToTopicCommand(topicId, featureId, attributes);
      this.execute(command);
    }
  

  /** */
  removeFeatureFromTopic(topicId: number, featureId: number) {
    const command = new RemoveFeatureFromTopicCommand(topicId, featureId);
    this.execute(command);
  }

  /** */
  removeControlFromTopic(topicId: number, controlId: string) {
    const command = new RemoveControlFromTopicCommand(topicId, controlId);
    this.execute(command);
  }

    /** */
    removeLayoutFromTopic(topicId: number, layoutId: string) {
      const command = new RemoveLayoutFromTopicCommand(topicId, layoutId);
      this.execute(command);
    }

      
    removeGoToLinkFromTopic(topicId: number, linkId: string): void {
      const command = new RemoveGoToLinkFromTopicCommand(topicId, linkId);
      this.execute(command);
    }

  /** */
  execute(command: Command) {
    this._actionRunner.execute(command);
  }
}

export default StandaloneActionDispatcher;
