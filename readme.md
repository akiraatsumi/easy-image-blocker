# Easy Image Blocker
Easy Image Blockerは画像の読込みを制御します。各画像はContestMenuで個別に読込ませることができます。画像を読み込むURLを指定できます。
Easy Image Blocker can control to loading images. Images can be load from the context menu individually. You can specify the URL to load the image in the white list.

最新のFirefoxでImage like Operaが正常に動作しなくなってしまったので、機能は及びませんがWebextensionsベースで作成してみました。
以下の機能があります。

## 4つの動作モード(Modes)
1. 全ての画像を読み込まない&nbsp;(Load no images)
1. キャッシュされた画像のみ読み込む&nbsp;(Load images you have read)
1. 開いているページのドメインの画像のみ読み込む&nbsp;(Load images on this site only)
1. 全ての画像を読み込む&nbsp;(Load all images)

## その他の機能(Preferences)
* 画像を読み込むURLを指定するホワイトリストの編集<br />Edit the whitelist that specifies the URL to load the image.
* ホワイトリストのインポート/エキスポート<br />Whitelist import / export.
* 画像省略時に表示するプレースホルダー文字列<br />Placeholder string to display when omitted.
* タブ毎にモードを独立して持つか否か<br />Whether to have modes independently for each tab or not.
* キャッシュのタイムアウト時間<br />Cache timeout time.
* モード変更ショートカットキーの指定<br />Specify the shortcut keys for mode changes.

## WebExtensions版の制限(Restriction of WebExtensions version)
* WebExtensionではFirefoxのキャッシュにアクセスすることができません。このため、アクセスした画像のURLを自前で管理し、キャッシュの代わりとしています。このため、「キャッシュのみ」にしても実際には画像を読み込んでおり、通信量は通常の読み込みと同等です。<br />WebExtensions can not access Firefox's cache. For this reason, its keeps the URL of the accessed image on our own and use it instead of the cache. Therefor, even if you selected "cache only", the image is actually being read, and the communication volume is equivalent to normal reading.
* CSS内で指定されている画像の読み込み制御には対応していません。<br />It does not support read control of images specified in CSS.

## 履歴(History)
### ver. 3.1.0
* モード変更時のリロード処理の不具合修正。<br />Fix the bug for reload when mode changes.
* ショートカットキーに対応。<br />Add the shorrtcut key function.
* Hide image機能追加。<br />Add the hide image function.
### ver. 3.0.1
* imagesetも制御対象に加えた。<br />Also add imageset to control.(thanks L)
### ver. 3.0.0
* WebExtensions版リリース。<br />WebExtensions version.
### ver. 2.3.0
* WebExtension版に向けたデータ移行対応。<br />Data migration for WebExtension version.
### ver. 2.2.0
* コンテキストメニューの追加を選択可能にした。<br />Selectable addition of context menu.
### ver. 2.1.0
* ホワイトリストのimport/export機能追加。<br />Add import / export function of whitelist.
### ver. 2.0.0
* タブ毎にモードを持てるようにしました。<br />Allowed to have a mode for each tab.
* ホワイトリストの編集をリストダイアログ形式にしました。<br />It can edit the white list at the list dialog.
* CSSファイルのイメージにも対応しました。<br />Block the css images too.
