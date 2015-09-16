#!/usr/bin/env node

var CartoDB = require('cartodb');
var moment = require('moment');
var program = require('commander');

program
    .version('0.0.1')
    .usage('[options]')
    .option('-t, --table [ratings_table]', 'The table to insert into', 'street_ratings')
    .option('-s, --streetstable [streets_table]', 'The table containing street segments', 'streets')
    .option('-u, --username [username]', 'The username to use')
    .option('-k, --apikey [apikey]', 'The CartoDB API Key to use')
    .parse(process.argv);


var client = new CartoDB({ user: program.username, api_key: program.apikey });

client.on('connect', function () {
    client.query('SELECT cartodb_id FROM {table}', { table: program.streetstable }, function (err, data) {
        var valueStrings = [];
        data.rows.forEach(function (row) {
            if (Math.random() > 0.75) return;
            var segment_id = row.cartodb_id,
                rating = Math.floor((5 * Math.random()) + 1),
                recorded_by = 'eric',
                collected = moment().subtract(Math.floor(100 * Math.random()), 'days').toISOString(),
                comments = 'comments would go here';
            valueStrings.push('(' + segment_id + ',' + rating + ',' + "'" 
                              + recorded_by + "','" + collected + "','"
                              + comments + "')");
        });

        var insertQuery = 'INSERT INTO {table} ({columns}) VALUES {values}',
            params = {
                columns: 'segment_id,rating,recorded_by,collected,comments',
                table: program.table,
                values: valueStrings.join(',')
            };
        client.query(insertQuery, params, function (err, data) {
            if (err) {
                console.warn(err);
            }
            else {
                console.log('Success.');
            }
        });
    });
});

client.connect();
