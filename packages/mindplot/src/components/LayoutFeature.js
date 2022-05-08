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
import ContainerIcon from './forms/layout/ContainerIcon';
import RowIcon from './forms/layout/RowIcon';
import ColumnIcon from './forms/layout/ColumnIcon';
import TitleIcon from './forms/layout/TitleIcon';
import HrIcon from './forms/layout/HrIcon';
import TextIcon from './forms/layout/TextIcon';


const TopicLayoutFactory = {
  Container: {
    id: 'container',
    icon: ContainerIcon,
  },

  Row: {
    id: 'row',
    icon: RowIcon,
  },

  Column: {
    id: 'column',
    icon: ColumnIcon,
  },

  Title: {
    id: 'title',
    icon: TitleIcon,
  },

  Hr: {
    id: 'hr',
    icon: HrIcon,
  },

  Text: {
    id: 'text',
    icon: TextIcon,
  },

  createIcon(topic, model, readOnly) {
    $assert(topic, 'topic can not be null');
    $assert(model, 'model can not be null');

    const { icon: Icon } = TopicLayoutFactory._featuresMetadataById
      .filter((elem) => elem.id === model.getType())[0];
    return new Icon(topic, model, readOnly);
  },
};

TopicLayoutFactory._featuresMetadataById = [TopicLayoutFactory.Container, TopicLayoutFactory.Row, TopicLayoutFactory.Column, TopicLayoutFactory.Title, TopicLayoutFactory.Hr];

export default TopicLayoutFactory;
