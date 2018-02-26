var popupObj = {
    whiteList: [],
    whiteListMode: [],
    activeTabUrl: "",
    deletedUrl: "",
    modelist: ["btn_allblocks","btn_cacheonly","btn_thissite","btn_allload"],   // id名の要素番号=mode番号
    urlpattern: [],     // 追加するURLをフルパスで登録するか、hostだけか、host+pathか
    mode: 0,
    isInit: false
    //textInputPlaceHolder: ""  // URL入力欄のPlaceHolder
};

function $ (id) {
    return document.getElementById(id);
}

/** URLパターンを作る */
function makeUrlPattern(){
    // urlのパターンを作る
    let atag = document.createElement("a");
    atag.href = popupObj.activeTabUrl;
    document.body.appendChild(atag);
    popupObj.urlpattern = [];
    //// 検出できた色々なパターンを入れる
    if (atag.host != "") popupObj.urlpattern.push(atag.host);
    if (atag.href != "") popupObj.urlpattern.push(atag.href);
    if (atag.protocol != "" && atag.host != "") popupObj.urlpattern.push(atag.protocol + "//" + atag.host + "/");
    if ((atag.host + atag.pathname) != "") popupObj.urlpattern.push(atag.host + atag.pathname);
    document.body.removeChild(atag);
    popupObj.activeTabUrl = ( popupObj.urlpattern.length == 0 ) ? "" : popupObj.urlpattern[0];
}

/** URLだけ更新 */
function refreshTargetUrl(){
    $('input-field').value = popupObj.activeTabUrl;
}
/** Whitelistだけ更新 */
function refreshList() {
    let table = $('website-list-table');
    while (table.hasChildNodes()) table.removeChild(table.lastChild);
    $("input-field").setAttribute("placeholder", browser.i18n.getMessage("textInputPlaceHolder"));
    for (let i = popupObj.whiteList.length - 1; i >= 0; i--) {
        let tr = document.createElement('tr');
        let td1 = document.createElement('td');
        let td2 = document.createElement('td');
        /* set attributes */
        td1.setAttribute('type', 'close');
        td1.setAttribute("style", "color: #404040;");
        td1.setAttribute("mode", popupObj.whiteListMode[i]);
        td2.textContent = popupObj.whiteList[i];
        td2.setAttribute('type', 'item');
        td2.setAttribute("style", "color: #404040;");
        /* append children */
        tr.appendChild(td1);
        tr.appendChild(td2);
        table.appendChild(tr);
    }
}
/** モードアイコン選択 */
function setModeIcon(){
    for( let i=0; i < popupObj.modelist.length; i++ ){
        $(popupObj.modelist[i]).setAttribute("mode",( popupObj.mode == i ) ? "selected" : "");
    }
}
/**
 * popup全般更新
 */
function refreshPopup() {
    let table = $('website-list-table');
    if( table != null ){
        // モードアイコンセット
        setModeIcon();
        // Whitelistテーブル作成
        refreshList();
        // 追加URLセット
        refreshTargetUrl();
    }
}
// URL追加
//noinspection JSUnusedLocalSymbols
function addInputFieldItem(e) {
    let value = $('input-field').value;
    if (value) {
        popupObj.whiteList = popupObj.whiteList.filter(function (e) {return e !== value});
        popupObj.whiteList.push(value);
        popupObj.whiteListMode.push(popupObj.mode);
        $('input-field').value = '';
        popupObj.activeTabUrl = "";
        refreshList();
        browser.runtime.sendMessage({command:"addurl", object:popupObj});
    }
}
//------------------------------------- イベント設定
/** ×ボタン */
$('website-list-table').addEventListener("click",
    /**
     * ×ボタン押下時の処理
     * @param {object} e イベントオブジェクト
     * @param {object} e.target ターゲット
     * @param {object} e.originalTarget 元のターゲット
     */
    function (e) {
    let target = e.target || e.originalTarget;
    if (target.tagName.toLowerCase() === 'td' || target.nodeName.toLowerCase() === 'td') {
        if (target.getAttribute('type') === 'close') {
            var url = target.parentNode.childNodes[1].textContent;
            // 一致するホワイトリストとモード削除
            for( let i=0; i < popupObj.whiteList.length; i++ ){
                if( popupObj.whiteList[i] === url ){
                    popupObj.whiteList.splice(i,1);
                    popupObj.whiteListMode.splice(i,1);
                    break;
                }
            }
            popupObj.activeTabUrl = url;
            $('input-field').value = url;
            refreshList();
            browser.runtime.sendMessage({command:"delurl", object: popupObj});
        }
    }
});

/** URL追加イベント登録 */
$('input-field-add').addEventListener("click", addInputFieldItem);
$('input-field').addEventListener('keypress', function (e) {
    let key = e.which || e.keyCode;
    if (key == 13) addInputFieldItem(e);
});

//noinspection JSUnusedLocalSymbols
/** URL切り替え */
$('input-field-url').addEventListener("click", function(e){
    if( popupObj.urlpattern.length > 0 ) {
        //noinspection JSUnusedAssignment
        let i=0;
        for (i = 0; i < popupObj.urlpattern.length; i++) {
            if (popupObj.urlpattern[i] == $('input-field').value) {
                break;
            }
        }
        i++;    // マッチした次をセットする
        if( i >= popupObj.urlpattern.length ){
            i = 0;
        }
        popupObj.activeTabUrl = popupObj.urlpattern[i];
        //noinspection JSJQueryEfficiency
        $("input-field").value = popupObj.activeTabUrl;
    }
});

/** モード */
$('table-modes').addEventListener("click",
    /**
     * ×ボタン押下時の処理
     * @param {object} e イベントオブジェクト
     * @param {object} e.target ターゲット
     * @param {object} e.originalTarget 元のターゲット
     */
    function (e) {
    let target = e.target || e.originalTarget;
    if (target.tagName.toLowerCase() === 'td' || target.nodeName.toLowerCase() === 'td') {
        let newmode = popupObj.modelist.indexOf(target.id);
        if( newmode != -1 ){
            if( newmode == popupObj.mode ){
                // 選択済みのmodeが選択されたらpopup close
                window.close();
            } else {
                popupObj.mode = newmode;
                setModeIcon();
                browser.runtime.sendMessage({command:"changemode", object:popupObj});
            }
        }
    }
});

/**
 * メッセージ受信処理
 * @param {object} request
 * @param {string} request.command コマンド文字列
 * @param {string} request.urllist ホワイトリストURL配列のJSON文字列
 * @param {string} request.modelist ホワイトリストの各URLのブロックモード配列のJSON文字列
 * @param {string} request.targeturl 対象URL
 * @param {int} request.mode 現在のブロックモード
 */
function recieveMessage(request) {
    switch( request.command ){
        case "popup":
            // リスト表示
            popupObj.whiteList = JSON.parse(request.urllist);
            popupObj.whiteListMode = JSON.parse(request.modelist);
            popupObj.activeTabUrl = request.targeturl;
            popupObj.mode = request.mode;
            refreshPopup();
            break;
        case "target":
            popupObj.activeTabUrl = request.targeturl;
            makeUrlPattern();
            refreshTargetUrl();
    }
}

/**
 * リストなど情報の要求
 */
var sending = browser.runtime.sendMessage({command: "getWhiteList"}); //.catch(onError);
// response受け取り
sending.then(recieveMessage); //.catch(onError);

/** recieveMessage */
browser.runtime.onMessage.addListener(recieveMessage);

//--- internationalization
[].forEach.call(document.querySelectorAll('[data-i18n]'), function(el) {
    el.setAttribute("title", browser.i18n.getMessage(el.getAttribute('data-i18n')));
});
