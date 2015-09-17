'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});
exports.init = init;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactRouter = require('react-router');

var _historyLibCreateBrowserHistory = require('history/lib/createBrowserHistory');

var _historyLibCreateBrowserHistory2 = _interopRequireDefault(_historyLibCreateBrowserHistory);

var _map = require('./map');

var _rate = require('./rate');

function init(opts) {
    var mountNode = document.getElementById(opts.appDOMId);
    var history = (0, _historyLibCreateBrowserHistory2['default'])();
    ratingsConfig.rootPath = opts.rootPath;

    var App = _react2['default'].createClass({
        displayName: 'App',

        render: function render() {
            return _react2['default'].createElement(
                'div',
                { className: 'app-container' },
                _react2['default'].createElement(_map.RatingsMap, null),
                this.props.children
            );
        }
    });

    _react2['default'].render(_react2['default'].createElement(
        _reactRouter.Router,
        { history: history },
        _react2['default'].createElement(
            _reactRouter.Route,
            { path: ratingsConfig.rootPath, component: App },
            _react2['default'].createElement(_reactRouter.Route, { path: 'rate/:id', component: _rate.Rate })
        )
    ), mountNode);
}

if (process.env.NODE_ENV === 'watching_development') {
    var opts = {
        appDOMId: 'app',
        rootPath: '/'
    };
    var initWithOpts = function initWithOpts() {
        init(opts);
    };
    if (document.readyState != 'loading') {
        initWithOpts();
    } else {
        document.addEventListener('DOMContentLoaded', initWithOpts);
    }
}