"use strict";

var contextmenuTAG = "contextmenu";

function ContextMenu() {
    if (!(this instanceof ContextMenu)) {
        return new ContextMenu();
    }
}

ContextMenu.prototype = {

    CONTEXT_MODE_ONE: 0,
    CONTEXT_MODE_ALL: 1,
    CONTEXT_MODE_HIDE_ONE: 2,
    CONTEXT_MODE_HIDE_ALL: 3,
    CONTEXT_MODE: this.CONTEXT_MODE_ONE,             // 現在のモード。但しコンテキストメニューが開かれてメニューを選択に行くとmouseleaveするのでモードは変わる
    CONTEXT_MODE_CLICKED: this.CONTEXT_MODE_ONE,    // コンテキストメニューが開かれた時のモード
    IMAGE_URL: "",

    /**
     * コンテキストメニューを再作成する
     */
    refreshContextMenu: function refreshContextMenu() {
        browser.contextMenus.removeAll();
        browser.storage.local.get("context_menu_hide").then((result)=> {
            // ここではOptionsから持ってくると間に合わないので非同期的に処理する
            if (!result.context_menu_hide) {
                browser.contextMenus.create({
                    id: "loadimage",
                    title: browser.i18n.getMessage("context_loadallimages"),
                    contexts: ["all"]
                });
                browser.contextMenus.onClicked.addListener(function (info, tab) {
                    if (info.menuItemId == "loadimage") {
                        switch( contextMenu.CONTEXT_MODE_CLICKED ) {
                            case contextMenu.CONTEXT_MODE_ONE:
                                // content側で再読み込みさせる
                                contextMenu.sendReload(contextMenu.IMAGE_URL);
                                break;
                            case contextMenu.CONTEXT_MODE_HIDE_ONE:
                                // content側で非表示にする
                                contextMenu.sendHide(contextMenu.IMAGE_URL);
                                break;
                            case contextMenu.CONTEXT_MODE_HIDE_ALL:
                                // content側で非表示にする
                                contextMenu.sendHideAll();
                                break;
                            default:
                                // 全画像読み込み指示
                                contextMenu.sendReloadAll();
                                break;
                        }
                    }
                });
            }
        });
    },

    /**
     * 指定画像の非表示を指示
     * @param url
     */
    sendHide: function sendHide(url) {
        debug.log(contextmenuTAG, "sendHide: url=" + url);
        blockedImage.addHide(tabManage.getTabId(), url);  // blockedimagesにHideで追加
        browser.tabs.sendMessage(tabManage.getTabId(), {command: "hide", url: url, alt: options.getAltStringConsideredPlaceholderType()});
    },

    /**
     * 全画像の非表示を指示
     */
    sendHideAll: function sendHideAll() {
        blockedImage.replaceStatus(tabManage.getTabId(), blockedImage.NONE, blockedImage.HIDE);  // NONEも、
        blockedImage.replaceStatus(tabManage.getTabId(), blockedImage.BLOCKED, blockedImage.HIDE);  // BLOCKEDも、
        blockedImage.replaceStatus(tabManage.getTabId(), blockedImage.FORCE, blockedImage.HIDE); // FORCEもHIDEにする
        browser.tabs.sendMessage(tabManage.getTabId(), {command: "hideall", alt: options.getAltStringConsideredPlaceholderType()});
        // コンテキストメニューをLoad Allにする
        this.changeContextMenuToLoadAll();
    },

    /**
     * 指定画像の再読込を指示
     * @param url
     */
    sendReload: function sendReload(url) {
        debug.log(contextmenuTAG, "sendReload: url=" + url);
        blockedImage.addForce(tabManage.getTabId(),contextMenu.IMAGE_URL);    // 読み込みOKリストに追加
        //blockedImage.removeBlocked(tabManage.getTabId(), url);        // blockedimagesから削除(reloadではbackground.blockImagesを通らない?)
        browser.tabs.sendMessage(tabManage.getTabId(), {command: "reload", url: url});
    },

    /**
     * 全画像の再読込を指示
     */
    sendReloadAll: function sendReloadAll() {
        blockedImage.replaceStatus(tabManage.getTabId(), blockedImage.BLOCKED, blockedImage.FORCE);   // 全部読むのでブロック無し
        browser.tabs.sendMessage(tabManage.getTabId(), {command: "reloadall"});
        // コンテキストメニューをHide Allにする
        this.changeContextMenuToHideAll();
    },

    /**
     * content_scriptにブロックされたimageがあるか問い合わせる
     * 返ってきた結果でcontextmenuのload all/hide allを切り替える
     */
    requestIsBlocked: function requestIsBlocked() {
        browser.tabs.sendMessage(tabManage.getTabId(), {command: "requestIsBlocked"});
    },

    /**
     * コンテキストメニューを単画像非表示に切り替え
     */
    changeContextMenuToHideSingle: function changeContextMenuToHideSingle() {
        this.CONTEXT_MODE = this.CONTEXT_MODE_HIDE_ONE;
        browser.contextMenus.update("loadimage", {
            title: browser.i18n.getMessage("context_hideimage")
        });
    },

    /**
     * コンテキストメニューを全画像非表示に切り替え
     */
    changeContextMenuToHideAll: function changeContextMenuToHideAll() {
        this.CONTEXT_MODE = this.CONTEXT_MODE_HIDE_ALL;
        browser.contextMenus.update("loadimage", {
            title: browser.i18n.getMessage("context_hideallimage")
        });
    },

    /**
     * コンテキストメニューを単画像読み込みに切り替え
     */
    changeContextMenuToLoadSingle: function changeContextMenuToLoadSingle(src, haseibsrc) {
        this.IMAGE_URL = src;
        //if( blockedImage.isExistBlocked(tabManage.getTabId(), this.IMAGE_URL) ){
        if( haseibsrc ){
            // ブロック済みなので reload を設定
            this.CONTEXT_MODE = this.CONTEXT_MODE_ONE;
            browser.contextMenus.update("loadimage", {
                title: browser.i18n.getMessage("context_loadimage")
            });
        } else {
            // ブロックされていないので hide を設定
            this.changeContextMenuToHideSingle();
        }
    },

    /**
     * コンテキストメニューを全画像読み込みに切り替え
     */
    changeContextMenuToLoadAll: function changeContextMenuToLoadAll() {
        // load allを設定
        this.CONTEXT_MODE = this.CONTEXT_MODE_ALL;
        browser.contextMenus.update("loadimage", {
            title: browser.i18n.getMessage("context_loadallimages")
        });
    },

    /**
     * コンテキストメニューを開いたときの画像情報とモードを記憶
     * @param url
     */
    setImageInfo: function setImageInfo(url){
        //this.IMAGE_URL = url; //もういらない
        this.CONTEXT_MODE_CLICKED = this.CONTEXT_MODE;
    }
};

var contextMenu = new ContextMenu();
// contextmenu生成
contextMenu.refreshContextMenu();
