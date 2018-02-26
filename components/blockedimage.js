"use strict";

var blockedImageTAG = "blockedimage";

function BlockedImage(){
    if (!(this instanceof BlockedImage)) {
        return new BlockedImage();
    }
}

BlockedImage.prototype = {
    NONE: 0,     // ブロック中でも強制読み込み予定でも無い
    BLOCKED: 1, // ブロック中
    FORCE: 2,   // 強制読み込み予定
    HIDE: 3,   // 強制非表示予定
    blockedimages: [],
    EIB_SRC_DUMMY: "",

    /**
     * blockedimages要素を追加する。
     * @param {int} tabid 対象のTabID
     * @param {string} url URL
     */
    addBlocked: function addBlocked(tabid, url){
        this._blockedImageInit(tabid);
        debug.log(blockedImageTAG, "addBlocked: tabid="+tabid+", url="+url);
        this._setStatus(tabid, url, this.BLOCKED);
    },

    /**
     * forceLoadImages要素を追加する。
     * @param {int} tabid 対象のTabID
     * @param {string} url URL
     */
    addForce: function addForce(tabid, url){
        this._blockedImageInit(tabid);
        debug.log(blockedImageTAG, "addForce: tabid="+tabid+", url="+url);
        this._setStatus(tabid, url, this.FORCE);
    },

    /**
     * hideImages要素を追加する。
     * @param {int} tabid 対象のTabID
     * @param {string} url URL
     */
    addHide: function addHide(tabid, url){
        this._blockedImageInit(tabid);
        debug.log(blockedImageTAG, "addHide: tabid="+tabid+", url="+url);
        this._setStatus(tabid, url, this.HIDE);
    },

    /**
     * blockimages要素を削除する。無ければNONEを追加。
     * @param {int} tabid 対象のTabID
     * @param {string} url URL
     */
    removeBlocked: function removeBlocked(tabid, url){
        this._blockedImageInit(tabid);
        let result = this._setStatusOnlySpecified(tabid, url, this.BLOCKED, this.NONE);
        // URLが見つからなければNONEで追加する。∵removeするということはImageはあるということなので、blockもforceも無しでリストに登録する。
        if( !result ){
            this.blockedimages[tabid][url] = this.NONE;
        }
    },

    /**
     * forceLoadImages要素を削除する。無ければNONEを追加。
     * @param {int} tabid 対象のTabID
     * @param {string} url URL
     */
    removeForce: function removeForce(tabid, url){
        this._blockedImageInit(tabid);
        let result = this._setStatusOnlySpecified(tabid, url, this.FORCE, this.NONE);
        // URLが見つからなければNONEで追加する。∵removeするということはImageはあるということなので、blockもforceも無しでリストに登録する。
        if( !result ){
            this.blockedimages[tabid][url] = this.NONE;
        }
    },

    /**
     * hideImages要素を削除する。無ければNONEを追加。
     * @param {int} tabid 対象のTabID
     * @param {string} url URL
     */
    removeHide: function removeHide(tabid, url){
        this._blockedImageInit(tabid);
        let result = this._setStatusOnlySpecified(tabid, url, this.HIDE, this.NONE);
        // URLが見つからなければNONEで追加する。∵removeするということはImageはあるということなので、blockもforceも無しでリストに登録する。
        if( !result ){
            this.blockedimages[tabid][url] = this.NONE;
        }
    },

    /**
     * tabid指定でblockedimagesのURLリストを返す
     * @param {int} tabid 対象のTabID
     * @param {int} status 対象の状態
     * @returns {Array} blockedimageリスト
     */
    getBlockdImages: function getBlockedImages(tabid, status) {
        this._blockedImageInit(tabid);
        let ary = [];
        for( let key in this.blockedimages[tabid] ){
            if( this.blockedimages[tabid][key] == status ){
                ary.push(key);
            }
        }
        return ary;
    },

    /**
     * 指定tabidにblockedImageが存在するか返す
     * @param {int} tabid 対象のTabID
     * @param {string} url URL
     * @returns {boolean} true=あった
     */
    isExistBlocked: function isExistBlocked(tabid, url){
        this._blockedImageInit(tabid);
        return this._isExist(tabid, url, this.BLOCKED);
    },

    /**
     * 指定tabidにforcedImageが存在するか返す
     * @param {int} tabid 対象のTabID
     * @param {string} url URL
     * @returns {boolean} true=あった
     */
    isExistForce: function isExistForce(tabid, url){
        this._blockedImageInit(tabid);
        return this._isExist(tabid, url, this.FORCE);
    },

    /**
     * 指定tabidにhideImageが存在するか返す
     * @param {int} tabid 対象のTabID
     * @param {string} url URL
     * @returns {boolean} true=あった
     */
    isExistHide: function isExistHide(tabid, url){
        this._blockedImageInit(tabid);
        return this._isExist(tabid, url, this.HIDE);
    },

    /**
     * 指定tabidのblocked要素数を返す
     * @param {int} tabid 対象のTabID
     * @returns {int} 長さ
     */
    getCountBlocked: function getCountBlocked(tabid) {
        this._blockedImageInit(tabid);
        return this._getCount(tabid, this.BLOCKED);
    },

    /**
     * 指定tabidのforceLoad要素数を返す
     * @param {int} tabid 対象のTabID
     * @returns {int} 長さ
     */
    getCountForce: function getCountForce(tabid) {
        this._blockedImageInit(tabid);
        return this._getCount(tabid, this.FORCE);
    },

    /**
     * ステータスを全件変更する
     * @param {int} tabid 対象のTabID
     * @param {int} before 変更前ステータス
     * @param {int} after 変更後ステータス
     */
    replaceStatus: function replaceStatus(tabid, before, after){
        debug.log(blockedImageTAG, "replaceStatus: tabid="+tabid+", before="+before+", after="+after);
        for( let key in this.blockedimages[tabid] ) {
            if( this.blockedimages[tabid][key]==before ){
                this.blockedimages[tabid][key] = after;
                //debug.log(blockedImageTAG, "replaced!: after="+this.blockedimages[tabid][key]+", key="+key);
            }
        }
    },

    /**
     * content_scriptから貰ったEIB_SRC_DUMMYをセットする
     * @param name
     */
    setEibSrcDummy: function setEibSrcDummy(name) {
        this.EIB_SRC_DUMMY = name;
    },

    /**
     * 無条件に初期化（tab読み込み時とか）
     * @param {int} tabid 対象のTabID
     */
    init: function init(tabid){
        this.blockedimages[tabid] = [];
    },

    /**
     * 指定された要素のステータスをセットする。無ければ追加。
     * @param {int} tabid 対象のTabID
     * @param {string} url 対象のURL
     * @param {int} status セットしたいステータス
     */
    _setStatus: function _setStatus(tabid, url, status) {
        let done = false;
        url = this._sanitizeUrl(url);
        for( let key in this.blockedimages[tabid] ){
            // あったら書き換え
            if( key == url ){
                this.blockedimages[tabid][url] = status;
                done = true;
                break;
            }
        }
        // 無かったら追加
        if( !done ){
            this.blockedimages[tabid][url] = status;
        }
    },

    /**
     * 指定されたURL & 指定されたステータスの要素をリセットする。URLが無ければNONEを追加。
     * @param {int} tabid 対象のTabID
     * @param {string} url 対象のURL
     * @param {int} filter ステータスの検索条件
     * @param {int} status セットしたいステータス
     * @return {boolean} true=要素はあった
     */
    _setStatusOnlySpecified: function _setStatusOnlySpecified(tabid, url, filter, status) {
        let found = false;
        url = this._sanitizeUrl(url);
        for( let key in this.blockedimages[tabid] ){
            // あったら書き換え
            if( key == url ) {
                if( this.blockedimages[tabid][url] == filter ) {
                    this.blockedimages[tabid][url] = status;
                }
                found = true;
                break;
            }
        }
        return found;
    },

    /**
     * 指定tabidに指定ステータスのimageが存在するか返す
     * @param {int} tabid 対象のTabID
     * @param {string} url URL
     * @param {int} filter ステータスの検索条件
     * @returns {boolean} true=あった
     */
    _isExist: function _isExist(tabid, url, filter) {
        //debug.log(blockedImageTAG,"_isExist(start): tabid=" + tabid + ", url=" + url + ", filter=" + filter);
        let isExist = false;
        url = this._sanitizeUrl(url);
        for (let key in this.blockedimages[tabid]) {
            //debug.log(blockedImageTAG,"_isExist(key search): key=" + key);
            if (key == url) {
                //debug.log(blockedImageTAG,"_isExist(key found): key=" + key+", value="+this.blockedimages[tabid][url]);
                if (this.blockedimages[tabid][url] == filter) {
                    isExist = true;
                }
                break;
            }
        }
        debug.log(blockedImageTAG,"_isExist(result): tabid=" + tabid + ", url=" + url + ", filter=" + filter + ", result=" + isExist);
        return isExist;
    },

    /**
     * 指定tabidの指定ステータスのimage数を返す
     * @param {int} tabid 対象のTabID
     * @param {int} filter ステータスの検索条件
     * @returns {int} 数
     */
    _getCount: function _getCount(tabid, filter) {
        this._blockedImageInit(tabid);
        let count = 0;
        for (let key in this.blockedimages[tabid]) {
            if (this.blockedimages[tabid][key] == filter) {
                count++;
            }
        }
        return count;
    },

    /**
     * 変数未定義だったら初期化
     * @param {int} tabid 対象のTabID
     */
    _blockedImageInit: function _blockedImageInit(tabid) {
        if (blockedImage.blockedimages[tabid] == null) {
            blockedImage.blockedimages[tabid] = [];
        }
    },

    /**
     * URLからEIBが付加した文字列を除外する
     * @param {string} url URL
     * @returns {string}
     */
    _sanitizeUrl: function _sanitizeUrl(url) {
        return url.replace("#" + this.EIB_SRC_DUMMY, "");
    }
};
var blockedImage = new BlockedImage();