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
import ControlModel from '../model/ControlModel';
import ControlType from '../model/ControlType';

class AddControlToTopicCommand extends Command {
  private _topicId: number;

  private _controlType: ControlType;

  private _attributes: object;

  private _controlModel: ControlModel;

  /*
    * @classdesc This command class handles do/undo of adding features to topics, e.g. an
    * icon or a note. For a reference of existing features, refer to {@link mindplot.TopicFeature}
    * @constructs
    * @param {String} topicId the id of the topic
    * @param {String} controlType the id of the feature type to add, e.g. "textfield"
    * @param {Object} attributes the attribute(s) of the respective feature model
    * @extends mindplot.Command
    * @see mindplot.model.ControlModel and subclasses
    */
  constructor(topicId: number, controlType: ControlType, attributes: object) {
    $assert($defined(topicId), 'topicId can not be null');
    $assert(controlType, 'controlType can not be null');
    $assert(attributes, 'attributes can not be null');

    super();
    this._topicId = topicId;
    this._controlType = controlType;
    this._attributes = attributes;
    this._controlModel = null;
  }

  execute(commandContext: CommandContext) {
    const topic = commandContext.findTopics([this._topicId])[0];

    // Feature must be created only one time.
    if (!this._controlModel) {
      const model = topic.getModel();
      this._controlModel = model.createControl(this._controlType, this._attributes);
    }
    topic.addControl(this._controlModel);
  }

  undoExecute(commandContext: CommandContext) {
    const topic = commandContext.findTopics([this._topicId])[0];
    topic.removeControl(this._controlModel);
  }
}

export default AddControlToTopicCommand;
