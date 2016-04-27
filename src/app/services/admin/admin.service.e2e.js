'use strict';

import chai from "chai";
import promised from "chai-as-promised";
chai.use(promised);
var expect = chai.expect;
import rp from 'request-promise';

import _ from 'lodash';

var backend = 'http://localhost:52876/api/';
var route = 'admin/ListManagement';

import {ID_PROP, API_BASE} from 'app/globals';


import AdminFixtures from './admin.fixtures';
//import TestSuite from '../../core/tests/TestSuite';


//var countAdd = 0;
//var getDropdownIds = _.map(AdminFixtures.COLLECTION, function(item){
//    return item[ID_NAME];
//});

//var getFixtures = copy(AdminFixtures.COLLECTION);

//var ts = new TestSuite({
//    allowedRest: ["GET", "PUT"],
//    route,
//    fixtures: AdminFixtures,
//    ignoreProperties: ["ID", "ListOptions.ID", "Name"]
//});
//describe("Admin Fixture Integration", ()=> {
//
//    ts.outputTests();
//
//});

import TestRest from '../../core/tests/api/TestRest';



//describe("Admin Fixture Integration", ()=> {
//
//    _.each(AdminFixtures.COLLECTION, (fixture,key)=>{
//        var tr = new TestRest({
//            allowedRest: ["GET", "PUT"],
//            //allowedRest: ["GET"],
//            route,
//            ignoreProperties: ["ID", "ListOptions.ID", "Name"],
//            id: fixture[ID_NAME],
//            showResponse: true,
//        });
//
//        describe("Testing PUT for COLLECTION #" + key, ()=>{
//            tr.testPUT();
//            tr.outputTests();
//
//        });
//
//
//
//        describe("Testing ADD ListOptions", ()=>{
//           tr.testPUT((fixture)=>{
//               var option = tr.copy(fixture.ListOptions[0]);
//               delete option[ID_NAME];
//               fixture.ListOptions.push(option);
//
//               return fixture;
//           });
//            tr.outputTests();
//        });
//
//    }, this);
//
//
//
//
//});
