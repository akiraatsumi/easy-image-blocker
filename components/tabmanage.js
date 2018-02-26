"use strict";

var tabmanageTAG = "tabmanage";

function TabManage(){
    if (!(this instanceof TabManage)) {
        return new TabManage();
    }
}

TabManage.prototype = {
    currenttabid: -1,
    currentTabUrl: "",
    tabUrls: [],
    setCurrentTabId: function setCurrentTabId(id){
        this.currenttabid = id;
    },
    setTabUrl(id, url){
        this.currentTabUrl = url;
        this.tabUrls[id] = url;
    },
    getTabUrl(id){
        return this.tabUrls[id];
    },
    getTabId: function getTabId(){
        return this.currenttabid;
    },
    // タブをリロードする
    reloadTab: function reloadTab(tabid) {
        browser.tabs.reload(tabid);
    }
};

/**
 * タブが生成された時にModeを初期化する
 * @param tabInfo
 */
function tabCreated(tabInfo){
    debug.log(tabmanageTAG, `tabCreated: id=${tabInfo.id} , status=${tabInfo.status} , url=${tabInfo.url}`);
    modeManage.initTabInfo(tabInfo);    // タブのモードのみ初期化
    //createされたからといってcurrentになるとは限らない tabManage.setCurrentTabId(tabInfo.id);
}
browser.tabs.onCreated.addListener(tabCreated);

/**
 * タブのURLが更新された時に情報を保持する
 * @param tabId
 * @param changeInfo
 * @param tabInfo
 */
function tabUpdated(tabId, changeInfo, tabInfo){
    if (changeInfo.url) {
        debug.log(tabmanageTAG, `tabUpdated: id=${tabId} , status=${tabInfo.status} , tabInfo=${tabInfo.url} , changeInfo=${changeInfo.url}`);
        modeManage.setTabInfo(tabId, tabInfo);
        tabManage.setTabUrl(tabId, tabInfo.url);
        blockedImage.init(tabId); // blockImageよりも真っ先にtabUpdatedに来るらしいのでここで初期化
        // contextmenuのLoadAll/HideAllを再設定（ブラウザの←→でも初期化したい）
        contextMenu.requestIsBlocked();
    }
}
browser.tabs.onUpdated.addListener(tabUpdated);

/**
 * タブが切り替えられたら
 * @param activeInfo {Object} informations
 */
function tabActivated(activeInfo) {
    //noinspection JSUnresolvedVariable
    let tabid = activeInfo.tabId;
    debug.log(tabmanageTAG, `tabActivated: id=${tabid}`);
    tabManage.setCurrentTabId(tabid);
    modeManage.setMode(tabid, modeManage.getModeRaw(tabid));    // currentの情報更新 & toolbar icon更新
    ctrlKeyUp();    // ctrlが押されながらtab切り替えされた場合はflagを落とす
}
browser.tabs.onActivated.addListener(tabActivated);

var tabManage = new TabManage();
