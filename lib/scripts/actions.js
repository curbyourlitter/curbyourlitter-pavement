'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});
exports.ratingsRequireReload = ratingsRequireReload;
var RATINGS_REQUIRE_RELOAD = 'RATINGS_REQUIRE_RELOAD';

exports.RATINGS_REQUIRE_RELOAD = RATINGS_REQUIRE_RELOAD;

function ratingsRequireReload(requireReload) {
    return {
        requireReload: requireReload,
        type: RATINGS_REQUIRE_RELOAD
    };
}