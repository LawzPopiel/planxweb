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

  router.get('/service-request', function(req, res, next) {
    var url_parts = url.parse(req.url, true);
    var query = url_parts.query;

    console.log('incidents/incident-list');

    request.get({
      url: host + '/v1/incidents/incident-list' ,
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

  return router;
})();
