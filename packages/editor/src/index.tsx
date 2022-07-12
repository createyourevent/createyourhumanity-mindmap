import 'bootstrap';
import React, { useEffect } from 'react';
import Toolbar, { ToolbarActionType } from '@wisemapping/editor/src/components/toolbar';
import Footer from '@wisemapping/editor/src/components/footer';
import { IntlProvider } from 'react-intl';
import {
    $notify,
    buildDesigner,
    PersistenceManager,
    DesignerOptionsBuilder,
    Designer,
    DesignerKeyboard,
    EditorRenderMode,
} from '@wisemapping/mindplot';
import './_custom.scss';
import I18nMsg from '@wisemapping/editor/src/classes/i18n-msg';
import Menu from '@wisemapping/editor/src/classes/menu/Menu';

declare global {
    // used in mindplot
    var designer: Designer;
    var accountEmail: string;
}

export type EditorOptions = {
    mode: EditorRenderMode,
    locale: string,
    zoom?: number,
    locked?: boolean,
    lockedMsg?: string;
    mapTitle: string;
    enableKeyboardEvents: boolean;
    isProfile: boolean;
}

export type EditorProps = {
    mapId: string;
    options: EditorOptions;
    values: Map<string, string> | null;
    grants: Map<string, string> | null;
    visible: Map<string, string> | null;
    isFriend: boolean;
    persistenceManager: PersistenceManager;
    onAction: (action: ToolbarActionType) => void;
    onLoad?: (designer: Designer) => void;
};

const Editor = ({
    mapId,
    options,
    values,
    grants,
    visible,
    isFriend,
    persistenceManager,
    onAction,
    onLoad,
}: EditorProps) => {

    useEffect(() => {
        // Change page title ...
        document.title = `${options.mapTitle} | WiseMapping `;

        // Load mindmap ...
        const designer = onLoadDesigner(mapId, options, persistenceManager);
        // Has extended actions been customized ...
        if (onLoad) {
            onLoad(designer);
        }



        // Load mindmap ...
        const instance = PersistenceManager.getInstance();
        const mindmap = instance.load(mapId);
        designer.loadMap(mindmap, values, grants, isFriend, visible);

        if (options.locked) {
            $notify(options.lockedMsg, false);
        }
    }, []);

    useEffect(() => {
        if (options.enableKeyboardEvents) {
            DesignerKeyboard.resume();
        } else {
            DesignerKeyboard.pause();
        }
    }, [options.enableKeyboardEvents]);

    let isProfile: boolean;
    if(values && grants && visible) {
        isProfile = true;
    } else {
        isProfile = false;
    }

    const onLoadDesigner = (mapId: string, options: EditorOptions, persistenceManager: PersistenceManager): Designer => {
        const buildOptions = DesignerOptionsBuilder.buildOptions({
            persistenceManager,
            mode: options.mode,
            mapId: mapId,
            container: 'mindplot',
            zoom: options.zoom,
            locale: options.locale,
            isProfile: options.isProfile,
        });

        // Build designer ...
        const result = buildDesigner(buildOptions);

        // Register toolbar event ...
        if (options.mode === 'edition-owner' || options.mode === 'edition-editor' || options.mode === 'edition-viewer' || options.mode === 'showcase') {
            const menu = new Menu(designer, 'toolbar');

            //  If a node has focus, focus can be move to another node using the keys.
            designer.cleanScreen = () => {
                menu.clear();
            };
        }
        return result;

    };

    const locale = options.locale;
    const msg = I18nMsg.loadLocaleData(locale);
    const mindplotStyle = (options.mode === 'viewonly') ? { top: 0 } : { top: 'inherit' };
    return (
        <IntlProvider locale={locale} messages={msg}>
            {(options.mode !== 'viewonly') &&
                <Toolbar
                    editorMode={options.mode}
                    onAction={onAction}
                />
            }
            <div id="mindplot" style={mindplotStyle} className="wise-editor"></div>
            <div id="mindplot-tooltips" className="wise-editor"></div>
            <Footer editorMode={options.mode} />
        </IntlProvider >
    );
}
export { Editor };
