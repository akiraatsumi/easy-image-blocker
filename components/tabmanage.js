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
    tabList: [],
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
    },
    // タブ毎のモードを取得する（window.onRemove()ではtabを全て閉じた後なので取れない）
    updateTabList: function updateTabList() {
        debug.log(tabmanageTAG, 'updateTabList');
        this.tabList = [];
        browser.tabs.query({}).then(function (tabs) {
            debug.log(tabmanageTAG, 'updateTabList-then');
            for (let tab of tabs) {
                let mode = modeManage.getModeRaw(tab.id);
                debug.log(tabmanageTAG, 'updateTabList: tabid=' + tab.id + ', mode=' + mode);
                tabManage.tabList.push(mode);
            }
        });
    },
    // タブ毎のモードを保存する
    saveTabInfo: function saveTabInfo(){
        options.setTabList(this.tabList);
    },
    // タブ毎のモードを復元する
    initTabInfo: function initTabInfo(){
        this.tabList = options.getTabList();
        debug.log(tabmanageTAG, 'initTabInfo: list=' + this.tabList);
        browser.tabs.query({}).then(function (tabs) {
            debug.log(tabmanageTAG, 'initTabInfo-then: num of tabs = '+ tabs.length);
            let cnt = 0;
            let mode = 0;
            for (let tab of tabs) {
                // モード
                if( tabManage.tabList[cnt] != 'undefined' ){
                    if( !modeManage.isModeSet(tab.id) ) {   // 既に初期化済みならやらない（上書きはしない）
                        mode = tabManage.tabList[cnt];
                        debug.log(tabmanageTAG, 'initTabInfo: tabid=' + tab.id + ', url=' + tab.url + ', setMode='+mode);
                        modeManage.setMode(tab.id, mode);
                    }
                } else {
                    break;
                }
                cnt++;
            }
            // 初期化が完了してから、カレントも復元する
            if( tabManage.currenttabid < 0 ){
                browser.tabs.query({currentWindow: true, active: true}).then(function(tabs){
                    for (let tab of tabs) {   // 1つしか無いはず
                        debug.log(tabmanageTAG, 'currenttabid=' + tab.id);
                        tabManage.setCurrentTabId(tab.id);
                        updateToolbarIcon(modeManage.getModeIcon(tab.id), modeManage.getModeString(tab.id));
                    }
                });
            }
        });
    }
};

/**
 * タブが生成された時にModeを初期化する
 * @param tabInfo
 */
function tabCreated(tabInfo){
    debug.log(tabmanageTAG, `tabCreated: id=${tabInfo.id} , status=${tabInfo.status} , url=${tabInfo.url}`);
    modeManage.initTabInfo(tabInfo);    // タブのモードのみ初期化
    tabManage.updateTabList();
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
        // tabManage.updateTabList();   ←initTabInfo中にupdateされてしまうのと、ここで実施する必要がないのでここではやらない
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
