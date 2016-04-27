'use strict';

import TestDataHandler from '../../core/tests/common/TestDataHandler';

import chai from "chai";
import promised from "chai-as-promised";
chai.use(promised);
import rp from 'request-promise';

var url = 'http://localhost:5151';
var backend = 'http://localhost:52876/api/';
var expect = chai.expect;

import _ from 'lodash';

import UserFixture from './user.fixtures';
//import AdminService from 'admin.service';


// Chai's expect().to.exist style makes default jshint unhappy.
// jshint expr:true

function copy(obj){
    return JSON.parse(JSON.stringify(obj))
}
//
//describe.skip('Protractor Demo App', function() {
//    it('should have a title', function() {
//        this.slow(6000);
//        browser.get(url);
//        expect(browser.getTitle()).to.eventually.equal('Pioneer PSTAR');
//
//    });
//    //it('should go to homepage', (done)=>{
//    //    browser.get(url);
//    //    expect(browser.getCurrentUrl()).toContain('/main-work/');
//    //    done();
//    //});
//    it('should get edit elements', (done)=>{
//        browser.get(url + "/main-work/1/edit");
//
//        //element.all(by.css("[ng-model]")).then(function(items){
//        //
//        //     for(var i in items) {
//        //         items[i].getAttribute('ng-model').then((text) => {
//        //             console.log(text);
//        //             if(text == 'ngModel') {
//        //                 items[i].getText().then( elem => console.log(elem));
//        //             }
//        //             //expect(items.length).to.equal(33);
//        //             done();
//        //         });
//        //     }
//        //
//        //});
//    });
//});

var testRoutes = [], collections;
var UserFixtures = copy(UserFixture);

if(UserFixtures.COLLECTION) {
    collections = UserFixtures.COLLECTION;
    delete UserFixtures.COLLECTION;
}
_.each(UserFixtures, function(data, route){
    testRoutes[route] = data;
}, this);


function getData(options) {
    return rp(options);
}

//describe.skip("API TEST", function(){
//
//    describe(": Testing User Routes", function(){
//        for(var route in testRoutes) {
//            describe(": GET " + route, function(){
//                var fetchedData, fixture = testRoutes[route];
//                before(function(done){
//                    var options = {
//                        uri: backend + route,
//                        json: true
//                    };
//                    getData(options).then((body) => {
//                        fetchedData = body;
//                        done();
//                    });
//                });
//
//                it("should have fixture properties", function(){
//                    expect(fetchedData).to.have.all.keys(fixture);
//                });
//                it("should have the right property types", function(){
//                    var serverTypes = TestDataHandler.getDataTypeMap(fetchedData);
//                    var fixtureTypes = TestDataHandler.getDataTypeMap(fixture);
//
//                    expect(fixtureTypes).to.equal(serverTypes);
//                });
//            });
//
//        }
//    });
//
//
//});