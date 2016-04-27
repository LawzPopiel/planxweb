'use strict';

import chai from "chai";
import promised from "chai-as-promised";
chai.use(promised);
var expect = chai.expect;
import rp from 'request-promise';

var backend = 'http://localhost:52876/api/';
var route = 'Transload';
import _ from 'lodash';
import TransloadTrackingFixture from './transload-tracking.fixtures';
//import TestSuite from '../../core/tests/TestSuite';
import TestRest from '../../core/tests/api/TestRest';
import TestList from '../../core/tests/api/TestList';
import moment from 'moment';
//var ts = new TestSuite({
//    allowedRest: ["POST", "GET", "PUT"],
//    ignoreProperties: ["CreatedBy", "ModifiedBy"],
//    route,
//    fixtures: TransloadTrackingFixture
//
//});


var restOpts = {
    allowedRest: ["POST", "GET", "PUT"],
    route,
    ignoreProperties: ["CreatedBy", "ModifiedBy", "InvoiceNumber"]
};
var tList = new TestList(restOpts);


describe("Transload Tracking Fixture Integration", ()=>{

    //_.each(TransloadTrackingFixture.COLLECTION, (fixture, key)=>{
    //    describe("TESTING FIXTURE #" + key, ()=>{
    //        restOpts.fixture = fixture;
    //        var tr = new TestRest(restOpts);
    //       tr.testPOST()
    //           .testPUT();
    //
    //        tr.outputTests();
    //    });
    //
    //});
    //tList.testLIST({
    //    fixture: TransloadTrackingFixture.COLLECTION[0],
    //    filter: {"CreatedOn": moment().format("YYYY-MM-DD")},
    //    testCount: true,
    //    testPagination: true,
    //    testFilter: { InvoiceNumber: "InvoiceNumber",
    //              StorageFacilityNumber: "StorageFacilityNumber"},
    //    testSorting: {"StorageFacilityNumber": "StorageFacilityNumber",
    //                    "InvoiceNumber":"InvoiceNumber",
    //                    "DeliveryTicketNumber": "DeliveryTicketNumber"}})

    //tList.outputTests();
});

export {restOpts}