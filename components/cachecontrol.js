"use strict";

var cachectrlTAG = "CacheControl";

function CacheControl() {
    if (!(this instanceof CacheControl)) {
        return new CacheControl();
    }
}

CacheControl.prototype = {

    cacheList: [],
    CACHE_ITEM_URL: 0,
    CACHE_ITEM_DATE: 1,

    /**
     * Chacheリスト初期化（Optionsから持ってくる）
     */
    initCacheList: function initCacheList() {
        this.cacheList = options.getCacheList();
    },

    /**
     * Cacheに存在するかを擬似的に返す
     * @param url
     * @param update {boolean} true=存在したら日時を更新する
     * @returns {boolean}
     */
    isExistInCache: function isExistInCache(url,update=false) {
        let len = url.length;   // 高速化のためurlの長さ毎にリストを分ける
        let found = false;
        if( this.cacheList[len] == null ){
            this.cacheList[len] = [];
        } else {
            for( let i=0; i<this.cacheList[len].length; i++){
                if( this.cacheList[len][i][this.CACHE_ITEM_URL] == url ) {
                    //debug.log(cachectrlTAG,`isExistInCache: url=${this.cacheList[len][i][this.CACHE_ITEM_URL]}, time=${this.cacheList[len][i][this.CACHE_ITEM_DATE]}`);
                    if( update ) {
                        // pushの時は既存ならtrueを返して日時更新
                        //debug.log(cachectrlTAG,`isExistInCache: update DATE`);
                        this.cacheList[len][i][this.CACHE_ITEM_DATE] = Date.now();
                        found = true;
                    } else {
                        // pushじゃない時は期限切れならfalseを返す
                        //debug.log(cachectrlTAG,`isExistInCache: Expirerd? now=${(Date.now() - options.getCacheExpireSeconds() * 1000)}, time=${this.cacheList[len][i][this.CACHE_ITEM_DATE]}`);
                        found = (this.cacheList[len][i][this.CACHE_ITEM_DATE] > (Date.now() - options.getCacheExpireSeconds() * 1000));
                    }
                    break;
                }
            }
        }
        debug.log(cachectrlTAG,`isExistInCache: judge=${found}, length=${url.length}, url=${url}`);
        return found;
    },

    /**
     * Cacheに積む
     * @param url
     */
    pushCache: function pushCache(url) {
        debug.log(cachectrlTAG,`pushCache: length=${url.length}, url=${url}`);
        let len = url.length;
        if( !this.isExistInCache(url,true) ){
            this.cacheList[len].push([url, Date.now()]);
        }
    },

    /**
     * 期限切れキャッシュを削除する
     */
    deleteExpiredCache: function deleteExpiredCache() {
        for( let j=0; j<this.cacheList.length; j++ ) {
            if( this.cacheList[j] != null ) {   // いきなり[52]とかあると0～51はnull
                //debug.log(cachectrlTAG, `deleteExpiredCache: j=${j}, length=${this.cacheList[j].length}`);
                for (let i = this.cacheList[j].length-1; i>=0; i--) {
                    // cacheListは日時更新するため日付順にはなっていないので地道に1つずつ削除
                    if ( this.cacheList[j][i][this.CACHE_ITEM_DATE] < (Date.now() - options.getCacheExpireSeconds()*1000) ) {
                        this.cacheList[j].splice(i,1);
                    }
                }
                //debug.log(cachectrlTAG, `deleteExpiredCache: deleted: length=${this.cacheList[j].length}`);
            }
        }
    },

    saveCacheList: function saveCacheList() {
        debug.log(cachectrlTAG,`saveCacheList: ${this.cacheList.length}`);
        options.setCacheList(this.cacheList);
    }
};

var cacheControl = new CacheControl();
// cacheControl.initCacheList();起動時はまだOptionsから読み込めていないのでここで呼んじゃダメ。OptionsのPromisの中からセットする。
