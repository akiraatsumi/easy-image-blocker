"use strict";

var optionsTAG = "components/options";

function Options() {
    if (!(this instanceof Options)) {
        return new Options();
    }
}

/**
 * 設定を取得/設定する
 * 値はPromiseで非同期に帰ってくるのでリアルタイムに値を返せない。
 * 初期化時にすべての値を変数に格納しておきそれを返す。
 * @constructor
 */
Options.prototype = {

    /** Placeholder置き換えMode */
    PLACEHOLDER_NONE : 0,
    PLACEHOLDER_ALT : 1,

    items: [],

    /**
     * 起動モードを返す
     * @returns {string} 0=block or 1=cached only or 2=this site or 3=load
     */
    getModeInit: function getModeInit() {
        return this.items["mode"];
    },
    /**
     * ホワイトリストを配列で返す
     * @returns {Array} ホワイトリスト([string,...])
     */
    getWhitelistArray: function getWhitelistArray() {
        //debug.log(optionsTAG, "getWhitelistArray: wl=" + JSON.stringify(this.whitelist));
        if (this.items["whitelist"] != null && typeof this.items["whitelist"] == "string") {
            return this.items["whitelist"].split(",");
        } else {
            return [];
        }
    },
    /**
     * ホワイトリストモードを配列で返す
     * @returns {Array} ホワイトリストモード([int,...])
     */
    getWhitelistModeArray: function getWhitelistModeArray() {
        let list = [];
        if (this.items["whitelist_mode"] != null && typeof this.items["whitelist_mode"] == "string") {
            let modes = this.items["whitelist_mode"].split(",");
            // stringを数値にする。数値じゃ無いと imagebloker.shouldLoad のswitch~caseにひっかからない。
            for (let mode of modes) {
                list.push(parseInt(mode, 0));  // 自分自身を書き換えると固まるぽいので違う配列に変換しながら入れる
            }
        }
        return list;
    },
    /**
     * ホワイトリストを文字列にして格納する
     * @param list {Array} 格納するホワイトリスト
     */
    setWhitelist: function setWhitelist(list){
        this.items["whitelist"] = list.join(",");
        browser.storage.local.set({whitelist: this.items["whitelist"]});
    },
    /**
     * ホワイトリストモードを文字列にして格納する
     * @param list {string} ホワイトリストモード（カンマ区切り）
     */
    setWhitelistMode: function setWhitelistMode(list){
        //noinspection JSUnresolvedFunction
        this.items["whitelist_mode"] = list.join(",");
        browser.storage.local.set({whitelist_mode: this.items["whitelist_mode"]});
    },
    /**
     * tab毎に独立して持つかを返す
     * @returns {boolean} true=独立して持つ
     */
    isTabIndependent: function isTabIndependent(){
        return this.items["tab_independent"];
    },
    /**
     * modeが変更されたらリロードするか?
     * @returns {boolean} true=引き継ぐ
     */
    isReloadModeChanged: function isReloadModeChanged(){
        return this.items["reload_mode"];
    },    /**
     * tab毎の初期値を現在のタブから引き継ぐか?
     * @returns {boolean} true=引き継ぐ
     */
    isTabTakeOver: function isTabTakeOver(){
        return this.items["tab_mode_take_over"];
    },
    /**
     * placeholerのタイプを返す
     * @returns {int} PLACEHOLDER_NONE=なし、PLACEHOLDER_ALT=ALT文字
     */
    getPlaceholderType: function getPlaceholderType(){
        return this.items["placeholder_type"];
    },
    /**
     * placeholderのテキストを返す
     * @returns {string} 文字列
     */
    getAltPlaceholderText: function getAltPlaceholderText(){
        return this.items["alt_placeholder_text"];
    },
    /**
     * PlageholderTypeを考慮したAlt文字列を返す
     * @returns {*}
     */
    getAltStringConsideredPlaceholderType: function getAltStringConsideredPlaceholderType() {
        return this.getPlaceholderType() == this.PLACEHOLDER_NONE ? "" : this.getAltPlaceholderText();
    },
    /**
     * コンテキストメニュー追加しない?
     * @returns {boolean} true=追加しない
     */
    // 起動時には間に合わないのでここの取得ではなく直接Promissで処理している
    //isHideContextMenu: function isHideContextMenu() {
    //    return this.items["context_menu_hide"];
    //},
    /**
     * コンテキストメニュー追加しない?
     * @returns {boolean} true=追加しない
     */
    isEnableHideImage: function isEnableHideImage() {
        return this.items["hide_image_enable"];
    },
    /**
     * 擬似キャッシュリストを読み出す
     * @returns {Array} リスト
     */
    getCacheList: function getCacheList() {
        return JSON.parse(this.items["cache_list"]);
    },
    /**
     * 擬似キャッシュを保存する
     * @param list {Array} リスト
     */
    setCacheList: function setCacheList(list) {
        this.items["cache_list"] = JSON.stringify(list);
        browser.storage.local.set({cache_list: this.items["cache_list"]});
    },
    /**
     * 前回終了時のタブ毎のモードを読み出す
     * @returns {Array} リスト
     */
    getTabList: function getTabList() {
        return JSON.parse(this.items["tab_mode_list"]);
    },
    /**
     * 終了時のタブ毎のモードを保存する
     * @param list {Array} リスト
     */
    setTabList: function setTabList(list) {
        this.items["tab_mode_list"] = JSON.stringify(list);
        browser.storage.local.set({tab_mode_list: this.items["tab_mode_list"]});
        debug.log(optionsTAG,'setTabList: list='+this.items["tab_mode_list"]);
    },
    /**
     * 擬似キャッシュ保存時間を取得する
     * @returns {int} 秒
     */
    getCacheExpireSeconds: function getCacheExpireSeconds() {
        return this.items["cache_expire_seconds"];
    },
    /**
     * モード切替ショートカットキーの1つめの機能キーを返す
     * @returns {string} キー
     */
    getShortrcutKeyMode1st: function getShortrcutKeyMode1st() {
        return this.items["shortcut_mode_1st"];
    },
    /**
     * モード切替ショートカットキーの2つめの機能キーが指定されているか否かを返す
     * @returns {boolean} true=shift指定
     */
    isShortrcutKeyMode2nd: function isShortrcutKeyMode2nd() {
        return this.items["shortcut_mode_2nd"];
    },
    /**
     * モード切替ショートカットキーの[次へ]のキーを返す
     * @returns {string} キー
     */
    getShortrcutKeyModeNext: function getShortrcutKeyModeNext() {
        return this.items["shortcut_mode_next"];
    },
    /**
     * モード切替ショートカットキーの各モード用のキーを返す
     * @returns {string} キー
     */
    getShortrcutKeyMode: function getShortrcutKeyMode(mode) {
        switch(mode){
            case modeManage.ALL_BLOCK:
                return this.items["shortcut_mode_0"];
            case modeManage.LOAD_CACHE:
                return this.items["shortcut_mode_1"];
            case modeManage.LOAD_THIS_SITE:
                return this.items["shortcut_mode_2"];
            case modeManage.LOAD_ALL:
                return this.items["shortcut_mode_3"];
        }
    },
    /**
     * 設定をローカル変数に読み込む
     */
    reloadOptions: function reloadOptions() {
        //var self = this;
        browser.storage.local.get("mode").then((result)=> {
            this.items["mode"] = parseInt(result.mode) || 0;
        });
        browser.storage.local.get("whitelist").then((result)=> {
            this.items["whitelist"] = result.whitelist || [];
        });
        browser.storage.local.get("whitelist_mode").then((result)=> {
            this.items["whitelist_mode"] = result.whitelist_mode || [];
        });
        browser.storage.local.get("access_key").then((result)=> {
            this.items["access_key"] = result.access_key || "L";
        });
        browser.storage.local.get("access_key_all").then((result)=> {
            this.items["access_key_all"] = result.access_key_all || "A";
        });
        browser.storage.local.get("reload_mode").then((result)=> {
            this.items["reload_mode"] = result.reload_mode || false;
        });
        browser.storage.local.get("placeholder_type").then((result)=> {
            this.items["placeholder_type"] = result.placeholder_type || 1;
        });
        browser.storage.local.get("alt_placeholder_text").then((result)=> {
            this.items["alt_placeholder_text"] = result.alt_placeholder_text || "[block]";
        });
        browser.storage.local.get("tab_independent").then((result)=> {
            this.items["tab_independent"] = result.tab_independent || false;
        });
        browser.storage.local.get("tab_mode_take_over").then((result)=> {
            this.items["tab_mode_take_over"] = result.tab_mode_take_over || false;
        });
        browser.storage.local.get("context_menu_hide").then((result)=> {
            this.items["context_menu_hide"] = result.context_menu_hide || false;
        });
        browser.storage.local.get("hide_image_enable").then((result)=> {
            this.items["hide_image_enable"] = result.hide_image_enable || false;
        });
        browser.storage.local.get("cache_list").then((result)=> {
            this.items["cache_list"] = result.cache_list || JSON.stringify([]);
            cacheControl.initCacheList();   // 読めたのでcachecontrolに通知
        });
        browser.storage.local.get("tab_mode_list").then((result)=> {
            this.items["tab_mode_list"] = result.tab_mode_list || JSON.stringify([]);
            tabManage.initTabInfo();        // 読めたのでtabmanagerに通知
        });
        browser.storage.local.get("cache_expire_seconds").then((result)=> {
            this.items["cache_expire_seconds"] = result.cache_expire_seconds || false;
        });
        browser.storage.local.get("shortcut_mode_1st").then((result)=> {
            this.items["shortcut_mode_1st"] = result.shortcut_mode_1st || 1;
        });
        browser.storage.local.get("shortcut_mode_2nd").then((result)=> {
            this.items["shortcut_mode_2nd"] = result.shortcut_mode_2nd || true;
        });
        browser.storage.local.get("shortcut_mode_next").then((result)=> {
            this.items["shortcut_mode_next"] = result.shortcut_mode_next || "`";
        });
        browser.storage.local.get("shortcut_mode_0").then((result)=> {
            this.items["shortcut_mode_0"] = result.shortcut_mode_0 || "1";
        });
        browser.storage.local.get("shortcut_mode_1").then((result)=> {
            this.items["shortcut_mode_1"] = result.shortcut_mode_1 || '2';
        });
        browser.storage.local.get("shortcut_mode_2").then((result)=> {
            this.items["shortcut_mode_2"] = result.shortcut_mode_2 || "3";
        });
        browser.storage.local.get("shortcut_mode_3").then((result)=> {
            this.items["shortcut_mode_3"] = result.shortcut_mode_3 || "4";
        });
    }

};

var options = new Options();
options.reloadOptions();

/**
 * 設定が更新された場合にこっちも更新
 * @param changes
 * @param area
 */
function storageChanged(changes, area) {
    let isContextChanged = false;
    let changedItems = Object.keys(changes);
    for (let item of changedItems) {
        if (changes[item].oldValue != changes[item].newValue) {
            debug.log(optionsTAG, `${item}=${changes[item].newValue}, area=${area}`);
            options.items[item] = changes[item].newValue;
            if( item == "context_menu_hide" ){
                isContextChanged = true;
            }
        }
    }
    // ContextMenu表示可否が変更されたら再設定する
    if( isContextChanged ) {
        contextMenu.refreshContextMenu();
    }
}
browser.storage.onChanged.addListener(storageChanged);