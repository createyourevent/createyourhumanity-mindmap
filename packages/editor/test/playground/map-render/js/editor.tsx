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
import React from 'react';
import ReactDOM from 'react-dom';
import { Editor,  EditorOptions } from '../../../../src/index';
import { Designer, LocalStorageManager, PersistenceManager } from '@wisemapping/mindplot/src';

const initialization = (designer: Designer) => {

  designer.addEvent('loadSuccess', () => {
    const elem = document.getElementById('mindplot');
    if (elem) {
      elem.classList.add('ready');
    }
  });
};

const persistence = new LocalStorageManager('samples/forms.wxml', true, false);
PersistenceManager.init(persistence);
const mapId = 'forms';
const options: EditorOptions = {
  zoom: 0.8,
  locked: false,
  mapTitle: "Develop Mindnap",
  mode: 'edition-owner',
  locale: 'en',
  enableKeyboardEvents: true,
  isProfile: true,
};

const values = JSON.parse('{"21":2,"22":"","25":"supi ....","26":"klslkjfsjdlk","27":true,"42":"sw-dev","46":"45kg","47":"34cm","48":"supi dupi hahahaha....dfgdfgdfg","56":"<p>srg</p><p>sdsfsdf</p>","57":"13:14","58":[{"display":"Test","value":"Test"},{"display":"Test2","value":"Test2"},{"display":"Test3","value":"Test3"},{"display":"Test4","value":"Test4"}],"59":"Zentralstrasse 41, 8212 Neuhausen am Rheinfall, Schweiz","66":2,"67":{"1":true,"2":false,"3":true,"4":false},"72":[3],"77":"2022-06-16","Geschlecht":"1"}');
const grants = JSON.parse('{}');
const visible = JSON.parse('{"122":"visible_visible","139":"visible_visible","140":"visible_visible","141":"visible_not-visible","142":"visible_not-visible","158":"visible_visible"}');
const isFriend = true;

ReactDOM.render(
  <Editor
    mapId={mapId}
    options={options}
    values={values}
    grants={grants}
    visible={visible}
    isFriend={isFriend}
    persistenceManager={persistence}
    onAction={(action) => console.log('action called:', action)}
    onLoad={initialization}
  />,
  document.getElementById('root'),
);
