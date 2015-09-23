import React from 'react';
import { connect } from 'react-redux';
import { History } from 'react-router';

import { ratingsRequireReload } from './actions';

var cartodbSql = new cartodb.SQL({ user: 'curbyourlitter' });

function mapStateToProps(state) {
    return {
        ratingsRequireReload: state.ratingsRequireReload
    };
}

export var RatingsMap = connect(mapStateToProps)(React.createClass({
    mixins: [History],

    ratingSql: 'SELECT MIN(streets.cartodb_id) AS cartodb_id, ST_collect(streets.the_geom_webmercator) AS the_geom_webmercator, AVG(ratings.rating) AS avg FROM street_ratings ratings LEFT JOIN streets ON ratings.segment_id = streets.cartodb_id',

    componentDidMount: function () {
        var id = React.findDOMNode(this.refs.map).id;
        this.initLeaflet(id);
        this.initCartoDB();
    },

    componentDidUpdate: function (prevProps, prevState) {
        // Reload the rating layer
        this.ratingLayer.setSQL(this.ratingSql);
        this.props.dispatch(ratingsRequireReload(false));
    },

    initLeaflet: function (id) {
        this.map = L.map(id, {
            center: [40.728, -73.95],
            zoom: 15
        });

        this.tileLayer = new L.StamenTileLayer('toner').addTo(this.map);
    },

    initCartoDB: function () {
        var mapId = React.findDOMNode(this.refs.map).id;
        var visJson = {
            user_name: 'curbyourlitter',
            type: 'cartodb',
            sublayers: [
                {
                    sql: 'SELECT * FROM streets',
                    cartocss: '#streets { line-width: 10; line-color: gray; line-opacity: 1; }'
                },
                {
                    sql: this.ratingSql,
                    cartocss: '#ratings { line-width: 10; line-color: red; line-opacity: 1; }'
                }
            ]
        };
        cartodb.createLayer(this.map, visJson, {
            cartodb_logo: false,
            infowindow: false,
            legends: false
        })
            .addTo(this.map)
            .done((layer) => {
                this.streetLayer = layer.getSubLayer(0);
                this.streetLayer.setInteraction(true);
                this.streetLayer.setInteractivity('cartodb_id');

                this.ratingLayer = layer.getSubLayer(1);

                layer.on('featureOver', (e, latlng, pos, data, layerIndex) => {
                    document.getElementById(mapId).style.cursor = 'pointer';
                });
                layer.on('featureOut', (e, layerIndex) => {
                    document.getElementById(mapId).style.cursor = null;
                });

                this.streetLayer.on('featureClick', (event, latlng, pos, data) => {
                    this.history.pushState(null, `${ratingsConfig.rootPath}rate/${data.cartodb_id}`);
                    cartodbSql.execute('SELECT the_geom FROM {{ table }} WHERE cartodb_id = {{ id }}', {
                        id: data.cartodb_id,
                        table: 'streets'
                    }, { format: 'GeoJSON' })
                        .done(data => {
                            if (this.highlightedStreetLayer) {
                                this.map.removeLayer(this.highlightedStreetLayer);
                            }
                            this.highlightedStreetLayer = L.geoJson(data, {
                                style: {
                                    color: 'blue',
                                    width: 20
                                }
                            }).addTo(this.map);
                        });
                });
            });
    },

    render: function () {
        return (
            <div ref="map" id="map" className="ratings-map"></div>
        );
    }
}));
