export const RATINGS_REQUIRE_RELOAD = 'RATINGS_REQUIRE_RELOAD';

export function ratingsRequireReload(requireReload) {
    console.log('ratingsRequireReload', requireReload);
    return {
        requireReload: requireReload,
        type: RATINGS_REQUIRE_RELOAD
    };
}
