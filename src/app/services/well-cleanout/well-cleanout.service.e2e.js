'use strict';

import chai from "chai";
import promised from "chai-as-promised";
chai.use(promised);
var expect = chai.expect;
import rp from 'request-promise';

var backend = 'http://localhost:52876/api/';
var route = 'WellToWell';

import _ from 'lodash';
import WellFixtures from './well-cleanout.fixtures';

//import TestSuite from '../../core/tests/TestSuite';
import TestRest from '../../core/tests/api/TestRest';
import TestList from '../../core/tests/api/TestList';

var restOpts = {
    allowedRest: ["POST", "GET", "PUT"],
    route,
    ignoreProperties: ["ID", "CreatedBy", "ModifiedBy", "InvoiceNumber"],
};


var tList = new TestList(restOpts);

describe("Well to Well Fixture Integration", ()=>{

    //_.each(WellFixtures.COLLECTION, (fixture, key)=>{
    //    describe("TESTING FIXTURE #" + key, ()=> {
    //        restOpts.fixture = fixture;
    //        var tr = new TestRest(restOpts);
    //        tr.testPOST()
    //            .testPUT();
    //
    //        tr.outputTests();
    //    });
    //});
    //
    //tList.testLIST({
    //    //debug: true,
    //    fixture: WellFixtures.COLLECTION[0],
    //    filter: {"ShipDate": '2015-11-01'},
    //    testCount: true,
    //    testPagination: true,
    //    testFilter: {"CleanoutBOLNumber": "CleanoutBOLNumber",
    //        "WellNameID":"WellNameToID",
    //        "ShipDate": "ShipDate"},
    //    testSorting: { CleanoutBOLNumber: "CleanoutBOLNumber",
    //        FreightVendor: "FreightVendorID",
    //        FreightDeliveryTicketNumber: "FreightDeliveryTicketNumber",
    //        FreightCompanyTruckNumber: "FreightCompanyTruckNumber",
    //        }
    //});

   // tList.outputTests();
});
