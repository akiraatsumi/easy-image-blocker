[English](readme.md) [日本語](readme_ja.md)
# Easy Image Blocker
Easy Image Blockerは画像の読込みを制御します。各画像はContestMenuで個別に読込ませることができます。画像を読み込むURLを指定できます。

最新のFirefoxでImage like Operaが正常に動作しなくなってしまったので、機能は及びませんがWebextensionsベースで作成してみました。
以下の機能があります。


## 4つの動作モード
1. 全ての画像を読み込まない
1. キャッシュされた画像のみ読み込む
1. 開いているページのドメインの画像のみ読み込む
1. 全ての画像を読み込む

## その他の機能
* 画像を読み込むURLを指定するホワイトリストの編集
* ホワイトリストのインポート/エキスポート
* 画像省略時に表示するプレースホルダー文字列
* タブ毎にモードを独立して持つか否か
* キャッシュのタイムアウト時間
* モード変更ショートカットキーの指定

## WebExtensions版の制限
* WebExtensionではFirefoxのキャッシュにアクセスすることができません。このため、アクセスした画像のURLを自前で管理し、キャッシュの代わりとしています。このため、「キャッシュのみ」にしても実際には画像を読み込んでおり、通信量は通常の読み込みと同等です。
* CSS内で指定されている画像の読み込み制御には対応していません。

## 履歴(History)
### ver. 3.1.1
* Hide image機能の有効/無効を切り替えられるようにした。
### ver. 3.1.0
* モード変更時のリロード処理の不具合修正。
* ショートカットキーに対応。
* Hide image機能追加。
### ver. 3.0.1
* imagesetも制御対象に加えた。
### ver. 3.0.0
* WebExtensions版リリース。
### ver. 2.3.0
* WebExtension版に向けたデータ移行対応。
### ver. 2.2.0
* コンテキストメニューの追加を選択可能にした。
### ver. 2.1.0
* ホワイトリストのimport/export機能追加。
### ver. 2.0.0
* タブ毎にモードを持てるようにしました。
* ホワイトリストの編集をリストダイアログ形式にしました。
* CSSファイルのイメージにも対応しました。

## リンク
add-on https://addons.mozilla.org/ja/firefox/addon/easy-image-blocker/<br />
github https://github.com/akiraatsumi/easy-image-blocker