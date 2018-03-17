let EIB_ALT_NAME = "EIB_ALT";
let EIB_SRC_NAME = "EIB_SRC";
let EIB_HEIGHT_NAME = "EIB_HEIGHT";
let EIB_WIDTH_NAME = "EIB_WIDTH";
let EIB_SRC_DUMMY = "__EIB_NO_IMAGE__";
let TAG = "ContentScript";
var debug = new Debug();

var options = {
    key1st: '',
    key2nd: '',
    modenext: '',
    modes: {}
};

/**
 * 強制読み込み
 * @param request
 * @param sender
 * @param sendResponse
 */
function recieveMessage(request, sender, sendResponse) {
    //debug.log(TAG, `recieveMessage: ${request.command}, url=${request.url}` );
    switch( request.command ){
        case "reload":
        case "reloadall":
            for( let i=0; i < this.document.images.length; i++ ) {
                let node = this.document.images[i];
                let eib_src = node.hasAttribute(EIB_SRC_NAME) ? convertToFullPath(node.getAttribute(EIB_SRC_NAME)) : "";
                let src = (eib_src=="") ? node.src : eib_src;
                if( request.command=="reloadall" || node.src == request.url || eib_src == request.url ) {
                    // 書き換えておいたALTを戻す
                    if( node.hasAttribute(EIB_ALT_NAME) ){
                        node.setAttribute("ALT", node.getAttribute(EIB_ALT_NAME));
                        node.removeAttribute(EIB_ALT_NAME);
                    }
                    // 取っておいたSRCがあれば削除する
                    if( node.hasAttribute(EIB_SRC_NAME) ){
                        node.removeAttribute(EIB_SRC_NAME);
                    }
                    // srcを再設定して画像を再読込させる
                    node.src = src;     // 最適化されてナシになる可能性がありそうなので、違う変数に入れてセットしておく。
                    // 取っておいたwidth/heightがあれば復活させる
                    if( node.hasAttribute(EIB_HEIGHT_NAME) ) {
                        let height = node.getAttribute(EIB_HEIGHT_NAME);
                        if( parseInt(height)>0 ){
                            node.height = height;
                        } else {
                            node.removeAttribute("height");
                        }
                        node.removeAttribute(EIB_HEIGHT_NAME);
                    }
                    if( node.hasAttribute(EIB_WIDTH_NAME) ) {
                        let width = node.getAttribute(EIB_WIDTH_NAME);
                        if( parseInt(width)>0 ){
                            node.width = width;
                        } else {
                            node.removeAttribute("width");
                        }
                        node.removeAttribute(EIB_WIDTH_NAME);
                    }
                }
            }
            // context切り替え
            reportIsBlocked();
            break;
        case "hide":
        case "hideall":
            for( let i=0; i < this.document.images.length; i++ ) {
                let node = this.document.images[i];
                let src = node.src;
                if( request.command=="hideall" || src == request.url ) {
                    // ALT,SRCを待避してから非表示にする（二重に処理しないようにチェック）
                    if( !node.hasAttributes(EIB_ALT_NAME) || null == node.getAttribute(EIB_ALT_NAME)) {
                        node.setAttribute(EIB_ALT_NAME, node.alt);  // alt指定無いとき、getAttribute()だと null になる。node.altだとブランク。
                        node.setAttribute("ALT", request.alt + node.alt);
                        node.setAttribute(EIB_SRC_NAME, node.getAttribute("SRC"));
                        // 非表示にする
                        //node.src = EIB_SRC_DUMMY;
                        node.src = node.src + "#" + EIB_SRC_DUMMY;
                        // altがブランク(place holder使用しない)ならwidthとheightを待避して設定する。∵表示上何も無くなってしまう
                        if (request.alt == "") {
                            node.setAttribute(EIB_HEIGHT_NAME, node.height);
                            node.setAttribute(EIB_WIDTH_NAME, node.width);
                            node.height = Math.max(24, node.height);
                            node.width = Math.max(24, node.width);
                        }
                    }
                }
            }
            // context切り替え
            reportIsBlocked();
            break;
        case "requestIsBlocked":
            reportIsBlocked();
            break;
    }
}
browser.runtime.onMessage.addListener(recieveMessage);

function reportIsBlocked() {
    // ブロックされているimageがあるかを返す
    let node = null;
    let result = false;
    for( let i=0; i < this.document.images.length; i++ ) {
        node = this.document.images[i];
        if( node.hasAttributes(EIB_ALT_NAME) && null != node.getAttribute(EIB_ALT_NAME)) {
            result = true;
            break;
        }
    }
    // 結果を通知
    if( result ){
        browser.runtime.sendMessage({command: "contextLoadAll"});
    } else {
        browser.runtime.sendMessage({command: "contextHideAll"});
    }
}

function convertToFullPath(url) {
    let result = "";
    let parser = document.createElement('a');
    parser.href = url;
    result = parser.href;
    parser = null;
    return result;
}

/**
 * ImageオブジェクトのURLを取得する。EIB_SRC_NAMEが入っていたらそっちをフルパスで返す。
 * @param {*} event
 * @returns {string} full URL
 */
function getEibSrcUrl(event) {
    let url = '';
    if( event.target.hasAttributes(EIB_SRC_NAME) && null != event.target.getAttribute(EIB_SRC_NAME) ) {
        url = convertToFullPath(event.target.getAttribute(EIB_SRC_NAME));
    } else {
        url = event.target.src;
    }
    return url;
}

/**
 * EIB_SRC_DUMMYをbackground側にも知らせる
 */
function sendEibSrcDummy() {
    browser.runtime.sendMessage({command: "setEibSrcDummy", name: EIB_SRC_DUMMY});
}

/**
 * image elementの上にマウスが居るときだけcontextmenuを単画像読み込みに切り替える
 */
function setSendMessageOnImages() {
    for( let cnt=0; cnt < document.images.length; cnt++ ){
        document.images[cnt].onmouseenter = function(event){
            browser.runtime.sendMessage({command: "contextLoadOne", src: getEibSrcUrl(event), haseibsrc: hasEibAlt(event)});
        };
        document.images[cnt].onmouseleave = function(event) {
            reportIsBlocked();
        }
    }
}
// 遅れて読み込まれた素材を改めて定義
//onload定義すると元のページのonloadが動かなくなってしまう window.onload = setSendMessageOnImages;
window.addEventListener("load", function() { setSendMessageOnImages(); }, false);

/**
 * EIB_ALT_NAMEが設定されているか否かを返す
 * @param {*} event
 * @returns {boolean} true=設定されている（＝非表示状態）
 */
function hasEibAlt(event) {
    return (event.target.hasAttributes(EIB_ALT_NAME) && null != event.target.getAttribute(EIB_ALT_NAME));
}

/**
 * 右クリック時のimageの情報をbackgroundに渡す
 * @param event
 */
document.addEventListener("click", function(event){
    let isright = (event.button == 2);
    let isImage = (event.target.nodeName=="IMG");
    if( isright ){
        browser.runtime.sendMessage({
            command: "contextSetImage",
            src: isImage ? getEibSrcUrl(event) : ""
        });
    }
}, false);

//------------------------------------------------------------ connect to background
// contentsを読み込んでからじゃ無いと相互にscriptと通信できないので、こちらからbackgroundにconnectionを張りに行く
// backgroundの個々のblockimageから設定しようとしても接続確立前のためかうまくいかない
var portMain = browser.runtime.connect({name:"port-main"});
portMain.onMessage.addListener((msg)=>{
   switch (msg.command){
       case "blockedimages":
           // ブロック済みイメージリストのALTを差し替え。
           if( msg.alt!=null && msg.alt.length > 0 && msg.images.length > 0 ) {
               for( let i=0; i < this.document.images.length; i++ ) {
                   let node = this.document.images[i];
                   if( msg.images!=null && msg.images.indexOf(node.src) ){  // src=''の時に必ずALT差し替えが発生してしまうのも防ぐ
                       node.setAttribute(EIB_ALT_NAME, node.alt);
                       node.setAttribute("ALT", msg.alt + node.alt);
                   }
               }
           }
           // イベント設定
           setSendMessageOnImages();
           break;
       case "shortcutkeys":
           options.key1st = msg.key1st;
           options.key2nd = msg.key2nd;
           options.modenext = msg.modenext;
           options.modes = msg.modes;
           break;
       case "requestEibSrcDummy":
           sendEibSrcDummy();
           break;
   }
});

//------------------------------------------------------------ ctrl key check
document.addEventListener('keydown', function (event){
    if(!event) event = window.event; // レガシー
    if(event.keyCode == event.DOM_VK_CONTROL){
        browser.runtime.sendMessage({command: "ctrlKeyDown"});
        //debug.log(TAG, "ctrlKeyDown");
    }
    // ショートカットキーによるモード変更
    if( options.key1st == 0 && event.ctrlKey || options.key1st == 1 && event.altKey ) {
        if (!options.key2nd || (options.key2nd && event.shiftKey)) {
            //debug.log(TAG,"code=" + event.keyCode + "char="+String.fromCharCode(event.keyCode));
            if (String.fromCharCode(event.keyCode) == options.modenext) {
                browser.runtime.sendMessage({command: "shortcutDown", mode: "next"});
            } else {
                for(let key in options.modes) {
                    // javascriptの連想配列のkeyは文字型になるので注意(Object.key()で取っても同じ)
                    if (String.fromCharCode(event.keyCode) == options.modes[key]) {
                        browser.runtime.sendMessage({command: "shortcutDown", mode: parseInt(key)});
                        break;
                    }
                }
            }
        }
    }
}, false);
document.addEventListener('keyup', function (event){
    if(!event) event = window.event; // レガシー
    if(event.keyCode == event.DOM_VK_CONTROL){  // upの時はなぜかctrlKeyがfalseになっている
        browser.runtime.sendMessage({command: "ctrlKeyUp"});
        //debug.log(TAG, "ctrlKeyUp");
    }
},false);
