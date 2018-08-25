"use strict";

var browserActionTAG = "BrowserAction";

/**
 * ツールバーアイコンの設定
 * @param {string} path 設定するアイコンのパス
 * @param {string} title 設定するタイトル
 */
function updateToolbarIcon(path, title){
    browser.browserAction.setIcon({path: path});
    browser.browserAction.setTitle({title: title});
}

/**
 * ctrlを押しながらツールバーアイコンが押されたらモードを1つ次へ
 */
function handleClick() {
    debug.log(browserActionTAG,"ActionButton.onClick");
    //let kbe = KeyboardEvent;
    if( isControlKeyPress ) {
        // modeup
        modeManage.upMode(tabManage.getTabId());
        // Tab毎のモード更新
        tabManage.updateTabList();
    }
}

browser.browserAction.onClicked.addListener(handleClick);
