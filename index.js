#!/usr/bin/env node

(function () {
    'use strict';

    var express = require('express');

    var app = express();
    var port = process.env.PORT || 8000;

    app.use(express.compress());
    app.use(express.logger('dev'));
    app.use(express.static(__dirname + '/public'));
    app.use(express.bodyParser());

    app.get('/api/test', function (request, response) {
        console.log('query:');
        console.log(request.query);
        response.json(request.query);
    });

    app.post('/api/test', function (request, response) {
        console.log('body:');
        console.log(request.body);
        response.json(request.body);
    });

    var server = app.listen(port, function () {
        console.info('Server started on port ' + server.address().port + '.');
    });
}());
