"use strict";

var modemanageTAG = "mode";

function ModeManage() {
    if (!(this instanceof ModeManage)) {
        return new ModeManage();
    }
}

ModeManage.prototype = {
    /**
     *  Block Mode
     *      0: all blocks
     *      1: load only in cached
     *      2: load only on this site.
     *      3: all load.
     */
    EIBMode: [],
    lastEIBMode: null,    // 直近のMode(全tab共通時に使用)
    ALL_BLOCK: 0,
    LOAD_CACHE: 1,
    LOAD_THIS_SITE: 2,
    LOAD_ALL: 3,
    // 現在のtabのURL
    tabHost: [""],

    icon: {
        ALL_BLOCK: "icons/icon16_loadnothing.png",
        LOAD_CACHE: "icons/icon16_loadcache.png",
        LOAD_THIS_SITE: "icons/icon16_loadsite.png",
        LOAD_ALL: "icons/icon16_loadall.png"
    },

    getModeRaw: function getModeRaw(tabid){
        debug.log(modemanageTAG, `getModeRaw: ind=${options.isTabIndependent()}, tabid=${tabid}, mode=${this.EIBMode[tabid]}, last=${this.lastEIBMode}`);
        // もし未初期化ならデフォルトをセット
        if( this.lastEIBMode == null ) this.lastEIBMode = options.getModeInit();
        if( this.EIBMode[tabid] == null ) this.EIBMode[tabid] = options.getModeInit();
        // 値を返す
        return options.isTabIndependent() ? this.EIBMode[tabid] : this.lastEIBMode;
    },

    getMode: function getMode(tabid, imgLocation) {
        if( tabid >=0 && imgLocation != null ){
            return getWhitelistMode(imgLocation, this.getModeRaw(tabid));
        } else {
            return this.getModeRaw(tabid);
        }
    },

    getModeString: function getModeString(tabid) {
        switch (this.getModeRaw(tabid)) {
            case this.ALL_BLOCK:
                return browser.i18n.getMessage("mode_string_all_block");
            case this.LOAD_CACHE:
                return browser.i18n.getMessage("mode_string_cache");
            case this.LOAD_THIS_SITE:
                return browser.i18n.getMessage("mode_string_this_site");
            case this.LOAD_ALL:
                return browser.i18n.getMessage("mode_string_load_all");
        }
        return "UNDEFINED";
    },

    getModeIcon: function getModeIcon(tabid) {
        //debug.log(modemanageTAG, "getModeIcon: mode=" + this.getModeString(tabid));
        switch (this.getModeRaw(tabid)) {
            case this.ALL_BLOCK:
                return this.icon.ALL_BLOCK;
            case this.LOAD_CACHE:
                return this.icon.LOAD_CACHE;
            case this.LOAD_THIS_SITE:
                return this.icon.LOAD_THIS_SITE;
            case this.LOAD_ALL:
                return this.icon.LOAD_ALL;
        }
        return this.icon.ALL_BLOCK;
    },

    /**
     * modeをセットする
     * @param tabid モードをセットするタブid
     * @param mode
     *       ALL_BLOCK: 0,
     *       LOAD_CACHE: 1,
     *       LOAD_THIS_SITE: 2,
     *       LOAD_ALL: 3
     */
    setMode: function setMode(tabid, mode) {
        debug.log(modemanageTAG, `setMode: tabid=${tabid}, mode=${mode}`);
        let oldMode = this.EIBMode[tabid];
        this.EIBMode[tabid] = mode;
        this.lastEIBMode = mode;
        updateToolbarIcon(this.getModeIcon(tabid), this.getModeString(tabid));
        // リロード設定ONならリロードする
        if( options.isReloadModeChanged() && oldMode != mode ){
            tabManage.reloadTab(tabid);
        }
    },
    /** モードを1つ進める */
    upMode: function upMode(tabid) {
        let mode = this.getModeRaw(tabid);
        mode++;
        if (mode > this.LOAD_ALL) {
            mode = this.ALL_BLOCK;
        }
        this.setMode(tabid, mode);
    },
    //----------------------------------------- tab
    /** タブ作成時にモードを初期化する。モードのみ。画面表示は更新しない（∵tabがactiveじゃない場合もあるため） */
    initTabInfo: function initTabInfo(tabInfo) {
        if( options.isTabTakeOver() ){
            // 前タブの設定を引き継ぐならlastを適用
            this.EIBMode[tabInfo.id] = this.lastEIBMode;
        } else {
            // 前タブの設定を引き継がないなら初期値を設定
            this.EIBMode[tabInfo.id] = options.getModeInit();
        }
    },
    /** タブ毎のURL(host)を持っておく */
    setTabInfo: function setTabInfo(tabid, tabInfo){
        this.tabHost[tabid] = tabInfo.url.host;
        updateToolbarIcon(this.getModeIcon(tabid), this.getModeString(tabid));
    }
};


/**
 * 現在のページがwhitelistにマッチするかを返す
 * @param {string} imgLocation 画像のURL。指定が無ければ現在のURLを取得する。
 * @param {number} defaultmode 現在選択されてるモード
 * @returns {number} モード
 */
function getWhitelistMode(imgLocation, defaultmode){
    let result = defaultmode;    // マッチしなければ現在のモード
    if (options != null) {
        let url;
        if( null == imgLocation ) {
            url = this.activeTabUrl;
        } else {
            url = imgLocation;
        }
        let lists = options.getWhitelistArray();
        let modes = options.getWhitelistModeArray();
        //debug.log(modemanageTAG, "domain=" + url + ", lists=" + options.getWhitelistArray());
        for (let i=0; i < lists.length; i++ ) {
            let regexp = new RegExp('.*' + lists[i] + '.*');
            if (regexp.test(url)) {
                if( modes.length > i && modes[i].length !== 0 ){
                    result = modes[i];  // モード指定があればそれ(ver.2.0.0以降)
                }
                break;
            }
            regexp = null;
        }
    } else {
        debug.log(modemanageTAG, "Preferences is null!");
    }
    //debug.log(modemanageTAG, "getWhitelistMode: result=" + result);
    return result;
}

var modeManage = new ModeManage();
