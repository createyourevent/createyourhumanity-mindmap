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
import LayoutModel from '../model/LayoutModel';

class RemoveLayoutFromTopicCommand extends Command {
  private _topicId: number;

  private _layoutId: string;

  private _oldLayout: LayoutModel;

  /**
     * @classdesc This command handles do/undo of removing a feature from a topic, e.g. an icon or
     * a note. For a reference of existing features, refer to {@link mindplot.TopicFeature}.
     */
  constructor(topicId: number, layoutId: string) {
    $assert($defined(topicId), 'topicId can not be null');
    $assert(layoutId, 'layoutModel can not be null');

    super();
    this._topicId = topicId;
    this._layoutId = layoutId;
    this._oldLayout = null;
  }

  /**
     * Overrides abstract parent method
     */
  execute(commandContext: CommandContext): void {
    const topic = commandContext.findTopics([this._topicId])[0];
    const layout = topic.findLayoutById(this._layoutId);
    topic._removeLayout(layout);
    this._oldLayout = layout;
  }

  /**
     * Overrides abstract parent method
     * @see {@link mindplot.Command.undoExecute}
     */
  undoExecute(commandContext: CommandContext) {
    const topic = commandContext.findTopics([this._topicId])[0];
    topic.addLayout(this._oldLayout);
    this._oldLayout = null;
  }
}

export default RemoveLayoutFromTopicCommand;
