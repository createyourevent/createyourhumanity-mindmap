import '../css/viewmode.css';
import React from 'react';
import ReactDOM from 'react-dom';
import { Editor, EditorOptions } from '../../../../src/index';
import { LocalStorageManager, Designer } from '@wisemapping/mindplot';

const initialization = (designer: Designer) => {

  designer.addEvent('loadSuccess', () => {
    const elem = document.getElementById('mindplot');
    if (elem) {
      elem.classList.add('ready');
    }

    // Code for selector of map.
    const mapSelectElem = document.getElementById('map-select') as HTMLSelectElement;
    if (mapSelectElem) {
      mapSelectElem.addEventListener('change', (e) => {
        // @ts-ignore
        const selectMap = e.target?.value;
        window.location.href = `${window.location.pathname}?id=${selectMap}`;
      });

      Array.from(mapSelectElem.options).forEach((option) => {
        option.selected = option.value === mapId;
      });
    }

  });
};

const values = JSON.parse('{"22":"","42":"sw-dev","46":"45","47":"34","48":"supi dupi hahahaha....","56":"<p>Ich bin eigentlich nicht schlecht....</p>","57":"","58":[{"display":"Test","value":"Test"},{"display":"Test2","value":"Test2"},{"display":"Test3","value":"Test3"},{"display":"Test4","value":"Test4"}],"59":"","66":6,"67":{"1":true,"3":true},"72":[1,4],"Geschlecht":"1"}');
const grants = JSON.parse('{"46":"NONE","47":"ALL","56":"FRIENDS","58":"FRIENDS","59":"FRIENDS","72":"NONE","Geschlecht":"FRIENDS"}');
const isFriend = true;

// Obtain map id from query param
const params = new URLSearchParams(window.location.search.substring(1));
const mapId = params.get('id') || 'welcome';
const persistence = new LocalStorageManager('samples/{id}.wxml', false);
const options: EditorOptions = {
  zoom: 0.8,
  locked: false,
  mapTitle: "Develop Mindnap",
  mode: 'viewonly',
  locale: 'en',
  enableKeyboardEvents: true
};

ReactDOM.render(
  <Editor
    mapId={mapId}
    options={options}
    values={values}
    grants={grants}
    isFriend={isFriend}
    persistenceManager={persistence}
    onAction={(action) => console.log('action called:', action)}
    onLoad={initialization}
  />,
  document.getElementById('root'),
);
