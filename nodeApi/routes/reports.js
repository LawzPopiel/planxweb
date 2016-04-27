/**
 * Created by bpowell on 1/20/16.
 */
module.exports = (function() {
  'use strict';
  var request = require('request');
  var router = require('express').Router();
  var argv = require('yargs').argv;
  var url = require('url');


  var host = "https://hsedev.pxd.com";

  if(argv.type === 'test'){
    host = "https://hsetest.pxd.com";
  }

  if(argv.type === 'prod'){
    host = "https://hse.pxd.com";
  }

  router.get('/reporting/corrective-actions', function(req, res, next) {
    var url_parts = url.parse(req.url, true);
    var query = url_parts.query;

    console.log('corrective-actions');

    request.get({
      url: host + '/v1/reporting/corrective-actions?sub-asset-identifier=' + query['sub-asset-identifier'] ,
      headers: {
        'Authorization': 'Basic ' + new Buffer('powel398:pioneer#7').toString('base64'),
        'Content-Type': 'application/json;',
        'Accept-Encoding': 'deflate,gzip'
      }
    }, function (error, response, body) {
      console.log('error: '+ response.statusCode);

      if (response.statusCode === 200) {

        res.json(body);
      }

    });
  });

  router.get('/reporting/hazard-section', function(req, res, next) {
    var url_parts = url.parse(req.url, true);
    var query = url_parts.query;

    console.log('hazard-section');

    request.get({
      url: host + '/v1/reporting/hazard-section?sub-asset-identifier=' + query['sub-asset-identifier'] ,
      headers: {
        'Authorization': 'Basic ' + new Buffer('powel398:pioneer#7').toString('base64'),
        'Content-Type': 'application/json;'
      }
    }, function (error, response, body) {
      if (response.statusCode === 200) {
        //console.log('error: '+ response.statusCode);
        res.json(body);
      }

    });
  });

  router.get('/reporting/incident-timeline', function(req, res, next) {
    var url_parts = url.parse(req.url, true);
    var query = url_parts.query;

    console.log('incident-timeline');

    request.get({
      url: host + '/v1/reporting/incident-timeline?sub-asset-identifier=' + query['sub-asset-identifier'],
      headers: {
        'Authorization': 'Basic ' + new Buffer('powel398:pioneer#7').toString('base64'),
        'Content-Type': 'application/json;'
      }
    }, function (error, response, body) {
      if (response.statusCode === 200) {
        //console.log('error: '+ response.statusCode);
        res.json(body);
      }

    });
  });

  router.get('/reporting/observation-category', function(req, res, next) {
    var url_parts = url.parse(req.url, true);
    var query = url_parts.query;

    console.log('observation-category');

    request.get({
      url: host + '/v1/reporting/observation-category?sub-asset-identifier=' + query['sub-asset-identifier'],
      headers: {
        'Authorization': 'Basic ' + new Buffer('powel398:pioneer#7').toString('base64'),
        'Content-Type': 'application/json;'
      }
    }, function (error, response, body) {
      if (response.statusCode === 200) {
        //console.log('error: '+ response.statusCode);
        res.json(body);
      }

    });
  });

  router.get('/reporting/incident-goals', function(req, res, next) {
    var url_parts = url.parse(req.url, true);
    var query = url_parts.query;

    console.log('incident-goals');

    request.get({
      url: host + '/v1/reporting/incident-goals?sub-asset-identifier=' + query['sub-asset-identifier'],
      headers: {
        'Authorization': 'Basic ' + new Buffer('powel398:pioneer#7').toString('base64'),
        'Content-Type': 'application/json;'
      }
    }, function (error, response, body) {
      if (response.statusCode === 200) {
        //console.log('error: '+ response.statusCode);
        res.json(body);
      }

    });
  });

  return router;
})();
