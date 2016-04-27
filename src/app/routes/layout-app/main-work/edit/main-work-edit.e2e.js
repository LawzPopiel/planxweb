'use strict';

import chai from "chai";
import promised from "chai-as-promised";
chai.use(promised);
var expect = chai.expect;
import rp from 'request-promise';

import _ from 'lodash';

import WellFixtures from '../../../../services/main-work-entry/main-work-entry.fixtures';

let url = `main-work/:id/edit`,
    fixtures = WellFixtures.COLLECTION,
    fixture = fixtures[0];

import TestForm from '../../../../core/tests/route/TestForm';

describe.only("Test Form", ()=>{
    describe(">> TESTs", ()=>{
        var tf = new TestForm({
            formName: "mainWorkFormEdit",
            ngModelStart: "vm.editItem",
            fixture: fixture,
            staticProperties: ["Diversion", 'SandSupplier.ServiceDate', 'SandSupplier.ReceiveDate'],
            ignoreProperties: ["ID", "CreatedBy", "ModifiedBy"]
        });
        tf
            .setEditPage(url)
            .testForm()
            .outputTests();
    });


});
