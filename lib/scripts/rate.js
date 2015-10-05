'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

require('moment-timezone');

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactRedux = require('react-redux');

var _actions = require('./actions');

var cartodbSql = new cartodb.SQL({ user: 'curbyourlitter' });

var PreviousRatings = _react2['default'].createClass({
    displayName: 'PreviousRatings',

    render: function render() {
        var _this = this;

        var ratingsList, average;
        if (this.props.ratings) {
            var ratings = this.props.ratings;
            ratingsList = ratings.map(function (rating) {
                return _react2['default'].createElement(PreviousRating, _extends({ onDelete: _this.props.onDelete, key: rating.cartodb_id }, rating));
            });

            average = ratings.reduce(function (sum, r) {
                return sum + r.rating;
            }, 0) / ratings.length;
            if (average) {
                average = Math.round(average * 10) / 10.0;
            } else {
                average = 0;
            }
        }

        return _react2['default'].createElement(
            'div',
            { className: 'rating-previous' },
            _react2['default'].createElement(
                'h1',
                null,
                this.props.street ? this.props.street.stname_lab.toLowerCase() : ''
            ),
            _react2['default'].createElement(
                'h2',
                null,
                'previously'
            ),
            _react2['default'].createElement(
                'div',
                null,
                'rated ',
                this.props.ratings ? this.props.ratings.length : 0,
                ' times, average ',
                average,
                ':'
            ),
            _react2['default'].createElement(
                'ul',
                null,
                ratingsList
            )
        );
    }
});

var PreviousRating = _react2['default'].createClass({
    displayName: 'PreviousRating',

    handleClick: function handleClick(e) {
        var _this2 = this;

        e.preventDefault();
        cartodbSql.execute('DELETE FROM {{ table }} WHERE cartodb_id = {{ id }}', {
            id: this.props.cartodb_id,
            table: 'street_ratings'
        }, { api_key: ratingsConfig.cartodbApiKey }).done(function (data) {
            _this2.props.onDelete(_this2.props.cartodb_id);
        });
    },

    render: function render() {
        return _react2['default'].createElement(
            'li',
            { className: 'rating-previous-item' },
            this.props.rating,
            ' on ',
            (0, _moment2['default'])(this.props.collected).tz('GMT').format('M/D/YYYY'),
            ' [',
            _react2['default'].createElement(
                'a',
                { href: '#', onClick: this.handleClick },
                '×'
            ),
            ']'
        );
    }
});

var previousRatingsContainer = function previousRatingsContainer(Component) {
    return _react2['default'].createClass({
        getInitialState: function getInitialState() {
            return {};
        },

        componentDidMount: function componentDidMount() {
            this.getRatings(this.props.streetId);
            this.getStreet(this.props.streetId);
        },

        componentWillReceiveProps: function componentWillReceiveProps(nextProps) {
            if (this.props.streetId !== nextProps.streetId) {
                this.getRatings(nextProps.streetId);
                this.getStreet(nextProps.streetId);
            }
        },

        getStreet: function getStreet(id) {
            var _this3 = this;

            this.setState({ id: id });
            cartodbSql.execute('SELECT * FROM {{ table }} WHERE cartodb_id = {{ id }}', {
                id: id,
                table: 'streets'
            }).done(function (data) {
                _this3.setState({ street: data.rows[0] });
            });
        },

        getRatings: function getRatings(id) {
            var _this4 = this;

            this.setState({ id: id });
            cartodbSql.execute('SELECT * FROM {{ table }} WHERE segment_id = {{ id }}', {
                id: id,
                table: 'street_ratings'
            }).done(function (data) {
                _this4.setState({ ratings: data.rows });
            });
        },

        reload: function reload() {
            this.getRatings(this.props.streetId);
        },

        render: function render() {
            return _react2['default'].createElement(Component, _extends({}, this.props, this.state));
        }
    });
};

var PreviousRatingsContainer = previousRatingsContainer(PreviousRatings);

var AddRating = _react2['default'].createClass({
    displayName: 'AddRating',

    handleSubmit: function handleSubmit(e) {
        var _this5 = this;

        e.preventDefault();
        cartodbSql.execute("INSERT INTO {{ table }} (segment_id, rating, collected, recorded_by, comments) VALUES ({{ segmentId }}, {{ rating }}, '{{ collected }}', '{{ collectedBy }}', '{{ comments }}')", {
            collected: this.state.collected,
            collectedBy: this.state.collectedBy,
            comments: this.state.comments,
            rating: this.state.rating,
            segmentId: this.props.streetId,
            table: 'street_ratings'
        }, { api_key: ratingsConfig.cartodbApiKey }).done(function (data) {
            _this5.success();
            _this5.props.onSuccess();
        }).error(function (error) {
            _this5.failure();
        });
    },

    isValid: function isValid() {
        return this.state.collected !== null && this.state.rating !== null && this.state.rating >= 1 && this.state.rating <= 5;
    },

    updateField: function updateField(name, value) {
        var _this6 = this;

        var updates = {};
        updates[name] = value;
        this.setState(updates, function () {
            _this6.setState({ valid: _this6.isValid() });
        });
    },

    success: function success() {
        var newState = this.getInitialState();
        newState.message = 'Success!';
        this.setState(newState);
    },

    failure: function failure() {
        this.setState({ message: 'We failed to add your rating. Try again and let us know if the problem persists.' });
    },

    getInitialState: function getInitialState() {
        return {
            collected: (0, _moment2['default'])().format('YYYY-MM-DD'),
            collectedBy: null,
            comments: null,
            message: null,
            rating: null,
            valid: false
        };
    },

    render: function render() {
        var _this7 = this;

        return _react2['default'].createElement(
            'form',
            { className: 'rating-add', onSubmit: this.handleSubmit },
            _react2['default'].createElement(
                'h2',
                null,
                'add another rating'
            ),
            (function () {
                if (_this7.state.message) {
                    return _react2['default'].createElement(
                        'div',
                        null,
                        _this7.state.message
                    );
                }
            })(),
            _react2['default'].createElement(
                'div',
                null,
                _react2['default'].createElement(
                    'label',
                    { htmlFor: 'rating' },
                    'rating'
                ),
                _react2['default'].createElement('input', { type: 'number', name: 'rating', onChange: function (e) {
                        return _this7.updateField('rating', e.target.value);
                    }, value: this.state.rating })
            ),
            _react2['default'].createElement(
                'div',
                null,
                _react2['default'].createElement(
                    'label',
                    { htmlFor: 'collected' },
                    'collected'
                ),
                _react2['default'].createElement('input', { type: 'date', name: 'collected', onChange: function (e) {
                        return _this7.updateField('collected', e.target.value);
                    }, value: this.state.collected })
            ),
            _react2['default'].createElement(
                'div',
                null,
                _react2['default'].createElement(
                    'label',
                    { htmlFor: 'collected_by' },
                    'collected by'
                ),
                _react2['default'].createElement('input', { type: 'text', name: 'collected_by', onChange: function (e) {
                        return _this7.updateField('collectedBy', e.target.value);
                    }, value: this.state.collectedBy })
            ),
            _react2['default'].createElement(
                'div',
                null,
                _react2['default'].createElement(
                    'label',
                    { htmlFor: 'comments' },
                    'comments'
                ),
                _react2['default'].createElement('textarea', { name: 'comments', onChange: function (e) {
                        return _this7.updateField('comments', e.target.value);
                    }, value: this.state.comments })
            ),
            _react2['default'].createElement('input', { type: 'submit', disabled: !this.state.valid })
        );
    }
});

var Rate = (0, _reactRedux.connect)()(_react2['default'].createClass({
    onAddSuccess: function onAddSuccess() {
        this.refs.previousRatings.reload();
        this.props.dispatch((0, _actions.ratingsRequireReload)(true));
    },

    onDeleteSuccess: function onDeleteSuccess() {
        this.refs.previousRatings.reload();
        this.props.dispatch((0, _actions.ratingsRequireReload)(true));
    },

    render: function render() {
        return _react2['default'].createElement(
            'div',
            { className: 'rating-panel' },
            _react2['default'].createElement(PreviousRatingsContainer, { ref: 'previousRatings', onDelete: this.onDeleteSuccess, streetId: this.props.params.id }),
            _react2['default'].createElement(AddRating, { streetId: this.props.params.id, onSuccess: this.onAddSuccess })
        );
    }
}));
exports.Rate = Rate;