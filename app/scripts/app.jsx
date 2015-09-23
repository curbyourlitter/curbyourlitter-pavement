import React from 'react';
import { combineReducers, createStore } from 'redux';
import { connect, Provider } from 'react-redux';
import { Route, Router } from 'react-router';
import createHistory from 'history/lib/createBrowserHistory';

import { RatingsMap } from './map';
import { Rate } from './rate';
import * as reducers from './reducers';

let store = createStore(combineReducers(reducers));

export function init(opts) {
    var mountNode = document.getElementById(opts.appDOMId);
    var history = createHistory();
    ratingsConfig.rootPath = opts.rootPath;

    var App = React.createClass({
        render: function () {
            return (
                <div className="app-container">
                    <RatingsMap/>
                    {this.props.children}
                </div>
            );
        }
    });

    React.render((
        <Provider store={store}>
            {() => {
                return (
                    <Router history={history}>
                        <Route path={ratingsConfig.rootPath} component={App}>
                            <Route path='rate/:id' component={Rate}/>
                        </Route>
                    </Router>
                );
            }}
        </Provider>
        ), mountNode
    );
}

if (process.env.NODE_ENV === 'watching_development') {
    var opts = {
        appDOMId: 'app',
        rootPath: '/'
    };
    var initWithOpts = function () {
        init(opts);
    }
    if (document.readyState != 'loading'){
        initWithOpts();
    }
    else {
        document.addEventListener('DOMContentLoaded', initWithOpts);
    }
}
