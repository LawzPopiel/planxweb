/**
 * Created by bpowell on 1/20/16.
 */
module.exports = (function() {
  'use strict';
  var request = require('request');
  var router = require('express').Router();
  var argv = require('yargs').argv;

  var host = "https://hsetest.pxd.com";

  if(argv.type === 'test'){
    host = "https://hsetest.pxd.com";
  }

  if(argv.type === 'prod'){
    host = "https://hse.pxd.com";
  }

  router.get('/referencedata', function(req, res, next) {
    request.get({
      url: host + '/v1/referencedata',
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

  router.get('/referencedata/pioneer-managers', function(req, res, next) {
    request.get({
      url: host + '/v1/referencedata/pioneer-managers',
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

  router.get('/referencedata/visible-emission', function(req, res, next) {
    request.get({
      url: host + '/v1/referencedata/visible-emission',
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

  router.get('/referencedata/spill-release-category', function(req, res, next) {
    request.get({
      url: host + '/v1/referencedata/spill-release-category',
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

  router.get('/referencedata/released-substance', function(req, res, next) {
    request.get({
      url: host + '/v1/referencedata/released-substance',
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

  router.get('/referencedata/line-category', function(req, res, next) {
    request.get({
      url: host + '/v1/referencedata/line-category',
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

  router.get('/referencedata/line-content', function(req, res, next) {
    request.get({
      url: host + '/v1/referencedata/line-content',
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

  router.get('/referencedata/line-material', function(req, res, next) {
    request.get({
      url: host + '/v1/referencedata/line-material',
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

  router.get('/referencedata/area-type', function(req, res, next) {
    request.get({
      url: host + '/v1/referencedata/area-type',
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

  router.get('/referencedata/area-category', function(req, res, next) {
    request.get({
      url: host + '/v1/referencedata/area-category',
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

  router.get('/referencedata/opsinfo-users', function(req, res, next) {
    request.get({
      url: host + '/v1/referencedata/opsinfo-users',
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

  router.get('/referencedata/hierarchy', function(req, res, next) {
    request.get({
      url: host + '/v1/referencedata/hierarchy',
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


  router.post('/referencedata/person', function(req, res, next) {

    var userIdForm = 'employee-identifier={'+
        '"ns0:GetReferenceDataPersonDetailsRequest":{'+
          '"xmlns:ns0":"http://www.pnr.com/business/ReferenceDataBusinessService/schema/RDBS/1",'+
          '"ns0:PioneerUserIdentifier":"powel398"'+
        '}'+
      '}';

    request.post({
      url: host + '/v1/referencedata/person',
      body: req.text.toString(),
      headers: {
        'Authorization': 'Basic ' + new Buffer('powel398:pioneer#7').toString('base64'),
        'Content-Type': 'application/x-www-form-urlencoded;application/json;'
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
