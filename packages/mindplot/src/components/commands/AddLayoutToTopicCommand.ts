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
import Command from '../Command';
import CommandContext from '../CommandContext';
import LayoutModel from '../model/LayoutModel';
import LayoutType from '../model/LayoutType';

class AddLayoutToTopicCommand extends Command {
  private _topicId: number;

  private _layoutType: LayoutType;

  private _attributes: object;

  private _layoutModel: LayoutModel;

  /*
    * @classdesc This command class handles do/undo of adding features to topics, e.g. an
    * icon or a note. For a reference of existing features, refer to {@link mindplot.TopicFeature}
    * @constructs
    * @param {String} topicId the id of the topic
    * @param {String} layoutType the id of the feature type to add, e.g. "textfield"
    * @param {Object} attributes the attribute(s) of the respective feature model
    * @extends mindplot.Command
    * @see mindplot.model.LayoutModel and subclasses
    */
  constructor(topicId: number, layoutType: LayoutType, attributes: object) {
    $assert($defined(topicId), 'topicId can not be null');
    $assert(layoutType, 'layoutType can not be null');
    $assert(attributes, 'attributes can not be null');

    super();
    this._topicId = topicId;
    this._layoutType = layoutType;
    this._attributes = attributes;
    this._layoutModel = null;
  }

  execute(commandContext: CommandContext) {
    const topic = commandContext.findTopics([this._topicId])[0];

    // Feature must be created only one time.
    if (!this._layoutModel) {
      const model = topic.getModel();
      this._layoutModel = model.createLayout(this._layoutType, this._attributes);
    }
    topic.addLayout(this._layoutModel);
  }

  undoExecute(commandContext: CommandContext) {
    const topic = commandContext.findTopics([this._topicId])[0];
    topic.removeLayout(this._layoutModel);
  }
}

export default AddLayoutToTopicCommand;
