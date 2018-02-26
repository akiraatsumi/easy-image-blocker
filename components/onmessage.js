"use strict";

var isControlKeyPress = false;
var onmessageTAG = "OnMessage";

function onError(error) {
    debug.log(`Error: ${error}`);
}

/**
 * backgroundに来るメッセージを一手に処理
 * @param request
 * @param sender
 * @param sendResponse
 * @returns {boolean}
 */
function handleMessage(request, sender, sendResponse){
    debug.log(onmessageTAG, "command=" + request.command);
    var response = {response: ""};
    let mode;
    switch( request.command ){
        case "ctrlKeyDown":
            isControlKeyPress = true;
            browser.browserAction.setPopup({popup: ""});
            break;
        case "ctrlKeyUp":
            isControlKeyPress = false;
            browser.browserAction.setPopup({popup: "popup/popup.html"});
            break;
        case "getWhiteList":
            let urllistRaw = options.getWhitelistArray();  // 文字列じゃ無いと渡せないぽい
            let urllist = JSON.stringify(urllistRaw);
            debug.log(onmessageTAG,"wll=" + urllist.length);
            //var urllist = JSON.stringify([0,1,2]);  // 文字列じゃ無いと渡せないぽい
            let modelist = JSON.stringify(options.getWhitelistModeArray());
            let targeturl = "";
            mode = modeManage.getModeRaw(tabManage.getTabId());
            browser.tabs.query({currentWindow: true, active: true}).then((tabs)=> {
                // 非同期で遅延してくるので別途sendMessageで送る
                targeturl = tabs[0].url;
                browser.runtime.sendMessage({command: "target", targeturl: targeturl}); // .catch(onError);
            });
            response = {command:"popup", urllist:urllist, modelist:modelist, targeturl:targeturl, mode:mode};
            break;
        case "delurl":
        case "addurl":
            // whitelist受け取り
            let whitelist = request.object.whiteList;
            let whitelistmode = request.object.whiteListMode;
            // 保存
            options.setWhitelist(whitelist);
            options.setWhitelistMode(whitelistmode);
            break;
        case "changemode":
            mode = request.object.mode;
            if( mode >= 0 ) {
                // モード変更
                modeManage.setMode(tabManage.getTabId(), mode);
            }
            break;
        case "contextLoadOne":
            debug.log(onmessageTAG, "contextLoadOne: src=" + request.src + ", haseibsrc=" + request.haseibsrc);
            // switch context menu to load A image.
            contextMenu.changeContextMenuToLoadSingle(request.src, request.haseibsrc);
            break;
        case "contextLoadAll":
            // switch context menu to load ALL images.
            contextMenu.changeContextMenuToLoadAll();
            break;
        case "contextHideAll":
            // switch context menu to hide ALL images.
            contextMenu.changeContextMenuToHideAll();
            break;
        case "contextSetImage":
            debug.log(onmessageTAG, "contextSetImage: src=" + request.src);
            contextMenu.setImageInfo(request.src);
            break;
        case "shortcutDown":
            debug.log(onmessageTAG, "shortcutDown: mode=" + request.mode);
            if ( request.mode == "next" ) {
                modeManage.upMode(tabManage.getTabId());
            } else {
                modeManage.setMode(tabManage.getTabId(), request.mode);
            }
            break;
        case "setEibSrcDummy":
            debug.log(onmessageTAG, "setEibSrcDummy: name=" + request.name);
            blockedImage.setEibSrcDummy(request.name);
            break;
    }
    //debug.log(onmessageTAG,"response:" + response.command + ", wl=" + response.urllist);
    if( sendResponse != null ){
        sendResponse(response);
    }
    return true;
}

browser.runtime.onMessage.addListener(handleMessage);

/**
 * ctrlキーフラグを落とす
 */
function ctrlKeyUp() {
    handleMessage({command:"ctrlKeyUp"}, null, null);
}