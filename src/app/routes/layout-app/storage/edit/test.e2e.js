/**
 * Created by Joseph on 1/11/2016.
 */
'use strict';

import chai from "chai";
import promised from "chai-as-promised";
chai.use(promised);
var expect = chai.expect;
import rp from 'request-promise';

import _ from 'lodash';

describe.skip("MOCHA Order TEST", ()=>{
   before(()=>{
        console.log("!Outer MOST Before");
   });
    beforeEach(()=>{
       console.log("& Outer MOST EACH BEFORE");
    });
    describe("Test inner", ()=>{
        before(()=>{
           console.log("!! First nested before");
        });
        beforeEach(()=>{
            console.log("&& first nested EACH before");
        });

        it("should run", ()=>{
           console.log("#1 it nested")
            expect(2).to.equal(2);
        });
        it("should run #2", ()=>{
            console.log("#1 #2 it nested")
            expect(2).to.equal(2);
        });
        describe("Testing 2nd inner", ()=>{
            before(()=>{
                console.log("!!! Second nested before");
            });
            beforeEach(()=>{
                console.log("&&& second nested EACH before");
            });
            it("should run", ()=>{
                console.log("##1 it nested")
                expect(2).to.equal(2);
            });
            it("should run #2", ()=>{
                console.log("##1 #2 it nested")
                expect(2).to.equal(2);
            });
        });
    });
    it("should run",()=>{
        console.log("outer IT");
        expect(2).to.equal(2);
    });

});