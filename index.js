(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});
exports.init = init;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

//import { combineReducers, createStore } from 'redux';
//import { Provider } from 'react-redux';

var _reactRouter = require('react-router');

var _historyLibCreateBrowserHistory = require('history/lib/createBrowserHistory');

var _historyLibCreateBrowserHistory2 = _interopRequireDefault(_historyLibCreateBrowserHistory);

//import * as reducers from './reducers';

function init(opts) {
    var mountNode = document.getElementById(opts.appDOMId);

    //let store = createStore(combineReducers(reducers));
    var history = (0, _historyLibCreateBrowserHistory2['default'])();

    var App = _react2['default'].createClass({
        displayName: 'App',

        render: function render() {
            return _react2['default'].createElement(
                'div',
                { className: 'app-container' },
                'hii',
                this.props.children
            );
        }
    });

    console.log(mountNode);

    _react2['default'].render(_react2['default'].createElement(
        _reactRouter.Router,
        { history: history },
        _react2['default'].createElement(_reactRouter.Route, { path: opts.rootPath, component: App })
    ), mountNode);

    /*
    React.render((
        <Provider store={store}>
            {() => {
                return (
                    <Router history={history}>
                        <Route path="/" component={App}></Route>
                    </Router>
                );
            }}
        </Provider>
        ), mountNode
    );
    */
}

// TODO if running on a page, not bundled
/*
if (document.readyState != 'loading'){
    init();
} else {
    document.addEventListener('DOMContentLoaded', init);
}
*/
module.exports = init;

},{"history/lib/createBrowserHistory":undefined,"react":undefined,"react-router":undefined}]},{},[1]);
