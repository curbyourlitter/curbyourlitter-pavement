'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactRouter = require('react-router');

var cartodbSql = new cartodb.SQL({ user: 'curbyourlitter' });

var RatingsMap = _react2['default'].createClass({
    displayName: 'RatingsMap',

    mixins: [_reactRouter.History],

    componentDidMount: function componentDidMount() {
        var id = _react2['default'].findDOMNode(this.refs.map).id;
        this.initLeaflet(id);
        this.initCartoDB();
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
        // TODO style as in the app
        var visJson = {
            user_name: 'curbyourlitter',
            type: 'cartodb',
            sublayers: [{
                sql: 'SELECT * FROM streets',
                cartocss: '#streets { line-width: 5; line-color: red; line-opacity: 0.5; }'
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
});
exports.RatingsMap = RatingsMap;