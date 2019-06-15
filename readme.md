[English](readme.md) [日本語](readme_ja.md)
# Easy Image Blocker
Easy Image Blocker can control to loading images. Images can be load from the context menu individually. You can specify the URL to load the image in the white list.

It has the following functions.

## Modes
1. Load no images
1. Load images you have read
1. Load images on this site only
1. Load all images

## Preferences
* Edit the whitelist that specifies the URL to load the image.
* Whitelist import / export.
* Placeholder string to display when omitted.
* Whether to have modes independently for each tab or not.
* Cache timeout time.
* Specify the shortcut keys for mode changes.

## Restriction of WebExtensions version
* WebExtensions can not access Firefox's cache. For this reason, its keeps the URL of the accessed image on our own and use it instead of the cache. Therefor, even if you selected "cache only", the image is actually being read, and the communication volume is equivalent to normal reading.
* It does not support read control of images specified in CSS.

## History
### ver. 3.1.5
* Changed how to get right-click event.
* Corrected the text displayed as the description of the icon.
### ver. 3.1.4
* Fixed the bug issue #4<br />
The mode is not restored when the tab is automatically restored at the time of browser startup.
### ver. 3.1.3
* Fixed the bug issue #3<br />
When the block is not correctly marked it will not be Load All Images on the context menu.
### ver. 3.1.2
* Fixed the bug issue #1<br />
The Event(onload, click) in the original page is overwritten by add-on.
### ver. 3.1.1
* Context menu of 'Hide image' can be switched to the enabel/disable.
### ver. 3.1.0
* Fix the bug for reload when mode changes.
* Add the shorrtcut key function.
* Add the hide image function.
### ver. 3.0.1
* Also add imageset to control.(thanks L)
### ver. 3.0.0
* WebExtensions version.
### ver. 2.3.0
* Data migration for WebExtension version.
### ver. 2.2.0
* Selectable addition of context menu.
### ver. 2.1.0
* Add import / export function of whitelist.
### ver. 2.0.0
* Allowed to have a mode for each tab.
* It can edit the white list at the list dialog.
* Block the css images too.

## Link
add-on https://addons.mozilla.org/firefox/addon/easy-image-blocker/<br />
github https://github.com/akiraatsumi/easy-image-blocker
