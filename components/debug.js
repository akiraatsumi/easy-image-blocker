"use strict";

const DEBUG = false;
const REGEX = /.*/;

/**
 * Debug log writer
 * @returns {Debug}
 * @constructor
 */
function Debug() {
    if (!(this instanceof Debug)) {
        return new Debug();
    }
}
/**
 * Print logs to console with TAG when DEBUG is true.
 * @param {string} tag TAG
 * @param {string} text log message
 */
Debug.prototype = {
    log: function log(tag, text) {
        if (DEBUG) {
            if (tag.match(REGEX) || text.match(REGEX)) {
                console.log("[" + tag + "]" + text);
            }
        }
    }
};

var debug = new Debug();
