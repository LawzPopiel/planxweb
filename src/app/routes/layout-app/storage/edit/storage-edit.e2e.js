'use strict';

import chai from "chai";
import promised from "chai-as-promised";
chai.use(promised);
var expect = chai.expect;
import rp from 'request-promise';

import _ from 'lodash';

import WellFixtures from '../../../../services/transload-tracking/transload-tracking.fixtures';

let id = 140,
    addUrl = `storage/add`,
    url = `storage/:id/edit`,
    state = 'app.storage.edit',
    vmObj = 'vm.editItem',
    allowedCommands = ["GET", "PUT", "POST"],
    fixtures = WellFixtures.COLLECTION,
    fixture = fixtures[0];

import TestForm from '../../../../core/tests/route/TestForm';

//describe("New Test Form", ()=>{
//    describe(">> TESTs", ()=>{
//        var tf = new TestForm({
//            formName: "StorageEditForm",
//            ngModelStart: "vm.editItem",
//            fixture: fixture,
//            staticProperties: ["InboundOutbound"],
//            ignoreProperties: ["ID", "CreatedBy", "ModifiedBy"]
//        });
//        tf
//            //.setAddPage(addUrl)
//            .setEditPage(url)
//            .testForm()
//            .outputTests();
//    });
//
//
//});
