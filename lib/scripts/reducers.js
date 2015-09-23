'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});
exports.ratingsRequireReload = ratingsRequireReload;

var _actions = require('./actions');

function ratingsRequireReload(state, action) {
    if (state === undefined) state = false;

    if (action.type === _actions.RATINGS_REQUIRE_RELOAD) {
        return action.requireReload;
    }
    return state;
}