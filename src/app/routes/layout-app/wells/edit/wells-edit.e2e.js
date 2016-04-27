'use strict';

import chai from "chai";
import promised from "chai-as-promised";
chai.use(promised);
var expect = chai.expect;
import rp from 'request-promise';

var backend = 'http://localhost:52876/api/';
var route = 'WellToWell';

import {LOCALHOST} from 'app/globals';

import WellFixtures from '../../../../services/well-cleanout/well-cleanout.fixtures';
import TestSuite from '../../../../core/tests/TestSuite';

let id = 1,
    url = `wells/${id}/edit`,
    state = 'app.wells.edit';

describe.skip("Form testing", function(){
    beforeEach(function(){
console.log(LOCALHOST);
        browser.get(LOCALHOST + url);
    });
    it("should go to the page", function(){
        expect(browser.getTitle()).to.eventually.equal("Jim");
    });
});
