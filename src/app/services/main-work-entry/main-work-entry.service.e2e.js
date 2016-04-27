'use strict';

import chai from "chai";
import promised from "chai-as-promised";
chai.use(promised);
var expect = chai.expect;
import rp from 'request-promise';
import _ from 'lodash';

var backend = 'http://localhost:52876/api/';
var route = 'MainWorkEntry';

import MainEntryFixtures from './main-work-entry.fixtures';
//import TestSuite from '../../core/tests/TestSuite';

import TestRest from '../../core/tests/api/TestRest';
import TestList from '../../core/tests/api/TestList';

var restOpts = {
    allowedRest: ["GET", "PUT"],
    route,
    ignoreProperties: [
        "Diversion",
        "ModifiedBy",
        "SandSupplier.Name",
        "SandSupplier.PONumber",
        "SandSupplier.POReceiptNumber",
        "SandSupplier.BOLNumber",
        "SandSupplier.MeshSize",
        "SandSupplier.MeshSizeGroupID",
        "SandSupplier.MeshSizeID",
        "SandSupplier.ServiceDate",
        "SandSupplier.ReceiveDate",
        "SandSupplier.AssetTeamGroupID",
        "SandSupplier.FleetDepartmentCodeGroupID",
        "SandSupplier.WellNameGroupID",
        "SandSupplier.StorageFacilityGroupID",
        "FreightVendors.ID",
        "FreightVendors.FreightVendorGroupID",
        "FreightVendors.WellNameGroupID",
        "FreightVendors.FleetDepartmentCodeGroupID",
        "FreightVendors.AssetTeamGroupID"
    ],
};
var tr = new TestRest(restOpts);
var tList = new TestList(restOpts);
/*
    WHEN WRITING THESE, IGNORE THESE: Diversion, BOLNumber
 */
//var ts = new TestSuite({
//    allowedRest: ["GET"],
//    route,
//    fixtures: MainEntryFixtures
//});
describe.skip("Main Entry Fixture Integration", ()=> {

    //_.each(MainEntryFixtures.COLLECTION, (fixture, key)=>{
    //    describe.only("TESTING FIXTURE #" + key, ()=>{
    //        restOpts.fixture = fixture;
    //        var tr = new TestRest(restOpts);
    //
    //        tr.testPUT();
    //        tr.outputTests();
    //    });
    //
    //});
    //tList.testLIST({
    //    fixture: MainEntryFixtures.COLLECTION[0],
    //    testCount: true,
    //    testPagination: true,
    //    testFilter: { SandSupplierID: "SandSupplierID",
    //        SandSupplierBOLNumber: "SandSupplierBOLNumber",
    //        SandSupplierPONumber: "SandSupplierPONumber",
    //        SandSupplierInvoiceNumber: "SandSupplierInvoiceNumber",
    //        SandSupplierServiceDate: "SandSupplierServiceDate",
    //        SandSupplierReceiveDate: "SandSupplierReceiveDate",
    //        FreightVendorID: "FreightVendorID",
    //        FreightVendorBOLNumber: "FreightVendorBOLNumber",
    //    },
    //    //testSorting: {"StorageFacilityNumber": "StorageFacilityNumber",
    //    //    "InvoiceNumber":"InvoiceNumber",
    //    //    "DeliveryTicketNumber": "DeliveryTicketNumber"}
    //    });

   // tList.outputTests();


});