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
import TextfieldIcon from './forms/control/TextfieldIcon';
import TextareaIcon from './forms/control/TextareaIcon';
import SelectIcon from './forms/control/SelectIcon';
import RadioIcon from './forms/control/RadioIcon';
import CheckboxIcon from './forms/control/CheckboxIcon';
import OptionIcon from './forms/control/OptionIcon';
import RadiogroupIcon from './forms/control/RadiogroupIcon';
import EditorIcon from './forms/control/EditorIcon';
import TimeIcon from './forms/control/TimeIcon';
import AddressIcon from './forms/control/AddressIcon';
import KeywordsIcon from './forms/control/KeywordsIcon';
import RatingsIcon from './forms/control/RatingsIcon';
import CalendarIcon from './forms/control/CalendarIcon';
import MulticheckboxIcon from './forms/control/MulticheckboxIcon';
import MultiselectboxIcon from './forms/control/MultiselectboxIcon';


const TopicControlFactory = {
  Textfield: {
    id: 'textfield',
    icon: TextfieldIcon,
  },

  Textarea: {
    id: 'textarea',
    icon: TextareaIcon,
  },

  Select: {
    id: 'select',
    icon: SelectIcon,
  },

  Radio: {
    id: 'radio',
    icon: RadioIcon,
  },

  Checkbox: {
    id: 'checkbox',
    icon: CheckboxIcon,
  },

  Option: {
    id: 'option',
    icon: OptionIcon,
  },

  Radiogroup: {
    id: 'radiogroup',
    icon: RadiogroupIcon,
  },

  Calendar: {
    id: 'calendar',
    icon: CalendarIcon,
  },

  Editor: {
    id: 'editor',
    icon: EditorIcon,
  },

  Time: {
    id: 'time',
    icon: TimeIcon,
  },

  Address: {
    id: 'address',
    icon: AddressIcon,
  },

  Keywords: {
    id: 'keywords',
    icon: KeywordsIcon,
  },

  Ratings: {
    id: 'ratings',
    icon: RatingsIcon,
  },

  Multiselectbox: {
    id: 'multiselectbox',
    icon: MultiselectboxIcon,
  },

  Multicheckbox: {
    id: 'multicheckbox',
    icon: MulticheckboxIcon,
  },




  createIcon(topic, model, readOnly, isProfile) {
    $assert(topic, 'topic can not be null');
    $assert(model, 'model can not be null');

    const { icon: Icon } = TopicControlFactory._featuresMetadataById
      .filter((elem) => elem.id === model.getType())[0];
    return new Icon(topic, model, readOnly, isProfile);
  },
};

TopicControlFactory._featuresMetadataById = [TopicControlFactory.Multicheckbox, TopicControlFactory.Multiselectbox, TopicControlFactory.Ratings, TopicControlFactory.Keywords, TopicControlFactory.Address, TopicControlFactory.Time, TopicControlFactory.Editor, TopicControlFactory.Textfield, TopicControlFactory.Textarea, TopicControlFactory.Select, TopicControlFactory.Checkbox, TopicControlFactory.Radio, TopicControlFactory.Radiogroup, TopicControlFactory.Option, TopicControlFactory.Calendar];

export default TopicControlFactory;
