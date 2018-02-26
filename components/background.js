// todo: http://localhost/wordpress/2017/06/がちゃんと出ない?→src=""だとmodeに関わらず[blk]が出ちゃう
// todo: コンテキストメニューショートカットキー→webextenstions未対応→対応中らしい
// todo: 日本語環境での動作確認

var count = 0;
var TAG = "background";

function onError(error) {
    debug.log(`Error: ${error}`);
}

/**
 * 画像ファイルの読み込みを制御
 * @param {object} requestDetails  リクエスト詳細
 * @param {int} requestDetails.tabId  tabid
 * @param {string} requestDetails.url  ブロック画像のURL
 * @returns {{cancel:boolean}} true=ブロックする
 */
function blockImages(requestDetails) {
    //debug.log(TAG, `Loading: ${requestDetails.url}, tabid=${requestDetails.tabId}`);
    // imagesにあれば読み込む
    let isCancel = true;
    let isCache = false;
    let tabid = requestDetails.tabId;
    let mode = modeManage.getMode(requestDetails.tabId, requestDetails.url);
    if( mode == modeManage.LOAD_ALL || requestDetails.url.substr(0,4) != "http" ) { // data:image...とかは除外
        // all loadならひとまず読み込み
        isCancel = false;
    } else {
        // リストにあれば無条件に読む
        if( blockedImage.isExistForce(tabid, requestDetails.url) ){
            isCancel = false;
            // リストから削除
            blockedImage.removeForce(tabid, requestDetails.url);
        }
    }
    // ここまででLoadの判断がされなかったらモード毎に判断
    if( isCancel ){
        switch (mode) {
            case modeManage.LOAD_CACHE:
                // cacheにあったら読む
                isCache = cacheControl.isExistInCache(requestDetails.url);
                isCancel = !isCache;
                break;
            case modeManage.LOAD_THIS_SITE:
                let tab_domain = tabManage.getTabUrl(tabid).split('/')[2];
                let img_domain = requestDetails.url.split('/')[2];
                isCancel = (tab_domain != img_domain);
                //debug.log(TAG, "tab=" + tab_domain + ", img=" + img_domain + ", is=" + isCancel);
                break;
        }
    }

    // 強制非表示を加味
    isCancel = (isCancel || blockedImage.isExistHide(tabid, requestDetails.url));

    if( isCancel ) {
        // blockedimagesに追加
        blockedImage.addBlocked(tabid, requestDetails.url);
    } else {
        // 読み込んだimageはキャッシュに積む。但しキャッシュからの読み込みの場合は積まない（日時更新されちゃう）
        if( !isCache && requestDetails.url.substr(0,4) == "http" ){
            cacheControl.pushCache(requestDetails.url);
        }
        // blockedimagesから削除
        blockedImage.removeBlocked(tabid, requestDetails.url);
    }

    debug.log(TAG, `blockImages: isCancel=${isCancel}, url=${requestDetails.url}`);
    return {
        cancel: isCancel
    }
}

// 読み込み時のイベント登録
browser.webRequest.onBeforeRequest.addListener(
    blockImages,
    {urls: ["<all_urls>"], types:["image","imageset"]},
    ["blocking"]
);

// contentsからの接続が通ったらブロックしたimageリストを送る
browser.runtime.onConnect.addListener(
    /**
     * いろいろ送付
     * @param {object} port リスナーオブジェクト
     * @param {function} port.postMessage postMessage関数
     * @param {*} port.sender.tab.id 送り主のタブID
     */
    (port)=> {
        // imageのALT差し替え&イベント設定処理
        let pltxt = options.getAltStringConsideredPlaceholderType();
        port.postMessage({command: "blockedimages", images: blockedImage.getBlockdImages(port.sender.tab.id, blockedImage.BLOCKED), alt: pltxt});
        // ショートカットキー送付。option変更時即送ろうと思ったけどactivetabが設定画面だし全部に送るの?ということで断念
        let modes = {};
        modes[modeManage.ALL_BLOCK] = options.getShortrcutKeyMode(modeManage.ALL_BLOCK);
        modes[modeManage.LOAD_CACHE] = options.getShortrcutKeyMode(modeManage.LOAD_CACHE);
        modes[modeManage.LOAD_THIS_SITE] = options.getShortrcutKeyMode(modeManage.LOAD_THIS_SITE);
        modes[modeManage.LOAD_ALL] = options.getShortrcutKeyMode(modeManage.LOAD_ALL);
        port.postMessage({command: "shortcutkeys",
            key1st: options.getShortrcutKeyMode1st(),
            key2nd: options.isShortrcutKeyMode2nd(),
            modenext: options.getShortrcutKeyModeNext(),
            modes: modes
        });
        // EIB_SRC_DUMMYを要求する
        port.postMessage({command: "requestEibSrcDummy"});
    }
);

// windowがクローズされる時にキャッシュを保存する
//noinspection JSUnusedLocalSymbols
browser.windows.onRemoved.addListener((windowId) => {
    cacheControl.deleteExpiredCache();
    cacheControl.saveCacheList();
    debug.log(TAG, "onWindowClose: cache close completed.");
});

