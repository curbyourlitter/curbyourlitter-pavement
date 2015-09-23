'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactRedux = require('react-redux');

var _reactRouter = require('react-router');

var _actions = require('./actions');

var cartodbSql = new cartodb.SQL({ user: 'curbyourlitter' });

function mapStateToProps(state) {
    return {
        ratingsRequireReload: state.ratingsRequireReload
    };
}

var RatingsMap = (0, _reactRedux.connect)(mapStateToProps)(_react2['default'].createClass({
    mixins: [_reactRouter.History],

    ratingSql: 'SELECT ST_collect(streets.the_geom_webmercator) AS the_geom_webmercator, AVG(ratings.rating) FROM street_ratings ratings LEFT JOIN streets ON ratings.segment_id = streets.cartodb_id GROUP BY ratings.segment_id',

    componentDidMount: function componentDidMount() {
        var id = _react2['default'].findDOMNode(this.refs.map).id;
        this.initLeaflet(id);
        this.initCartoDB();
    },

    componentDidUpdate: function componentDidUpdate(prevProps, prevState) {
        // Reload the rating layer
        this.ratingLayer.setSQL(this.ratingSql);
        this.props.dispatch((0, _actions.ratingsRequireReload)(false));
    },

    initLeaflet: function initLeaflet(id) {
        this.map = L.map(id, {
            center: [40.728, -73.95],
            zoom: 15
        });

        this.tileLayer = new L.StamenTileLayer('toner').addTo(this.map);
    },

    initCartoDB: function initCartoDB() {
        var _this = this;

        var mapId = _react2['default'].findDOMNode(this.refs.map).id;
        var visJson = {
            user_name: 'curbyourlitter',
            type: 'cartodb',
            sublayers: [{
                sql: 'SELECT * FROM streets',
                cartocss: '#streets { line-width: 7; line-color: gray; line-opacity: 1; }'
            }, {
                sql: this.ratingSql,
                cartocss: '#ratings { line-width: 7; line-color: blue; line-opacity: 1; [avg<=1] { line-color: #229A00; } [avg>1][avg<=2] { line-color: #FFCC00; } [avg>2][avg<=3] { line-color: #FFA300; } [avg>3][avg<=4] { line-color: #FF5C00; } [avg>4][avg<=5] { line-color: #B81609; } }'
            }]
        };
        cartodb.createLayer(this.map, visJson, {
            cartodb_logo: false,
            infowindow: false,
            legends: false
        }).addTo(this.map).done(function (layer) {
            _this.streetLayer = layer.getSubLayer(0);
            _this.streetLayer.setInteraction(true);
            _this.streetLayer.setInteractivity('cartodb_id');

            _this.ratingLayer = layer.getSubLayer(1);

            layer.on('featureOver', function (e, latlng, pos, data, layerIndex) {
                document.getElementById(mapId).style.cursor = 'pointer';
            });
            layer.on('featureOut', function (e, layerIndex) {
                document.getElementById(mapId).style.cursor = null;
            });

            _this.streetLayer.on('featureClick', function (event, latlng, pos, data) {
                _this.history.pushState(null, ratingsConfig.rootPath + 'rate/' + data.cartodb_id);
                cartodbSql.execute('SELECT the_geom FROM {{ table }} WHERE cartodb_id = {{ id }}', {
                    id: data.cartodb_id,
                    table: 'streets'
                }, { format: 'GeoJSON' }).done(function (data) {
                    if (_this.highlightedStreetLayer) {
                        _this.map.removeLayer(_this.highlightedStreetLayer);
                    }
                    _this.highlightedStreetLayer = L.geoJson(data, {
                        style: {
                            color: 'blue',
                            width: 20
                        }
                    }).addTo(_this.map);
                });
            });
        });
    },

    render: function render() {
        return _react2['default'].createElement('div', { ref: 'map', id: 'map', className: 'ratings-map' });
    }
}));
exports.RatingsMap = RatingsMap;