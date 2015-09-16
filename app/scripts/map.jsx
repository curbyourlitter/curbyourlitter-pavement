import React from 'react';
import { Navigation } from 'react-router';

var cartodbSql = new cartodb.SQL({ user: 'curbyourlitter' });

export var RatingsMap = React.createClass({
    mixins: [Navigation],

    componentDidMount: function () {
        var id = React.findDOMNode(this.refs.map).id;
        this.initLeaflet(id);
        this.initCartoDB();
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
        })
            .addTo(this.map)
            .done((layer) => {
                this.streetLayer = layer.getSubLayer(0);
                this.streetLayer.setInteraction(true);
                this.streetLayer.setInteractivity('cartodb_id');

                layer.on('featureOver', (e, latlng, pos, data, layerIndex) => {
                    document.getElementById(mapId).style.cursor = 'pointer';
                });
                layer.on('featureOut', (e, layerIndex) => {
                    document.getElementById(mapId).style.cursor = null;
                });

                this.streetLayer.on('featureClick', (event, latlng, pos, data) => {
                    this.transitionTo(ratingsConfig.rootPath + 'rate/' + data.cartodb_id);
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
});
