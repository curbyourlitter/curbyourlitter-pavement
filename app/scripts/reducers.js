import { RATINGS_REQUIRE_RELOAD } from './actions';

export function ratingsRequireReload(state = false, action) {
    if (action.type === RATINGS_REQUIRE_RELOAD) {
        return action.requireReload;
    }
    return state;
}
