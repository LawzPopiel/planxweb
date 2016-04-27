'use strict';

import angular from 'angular';
import 'angular-mocks';


import chai from "chai";
import promised from "chai-as-promised";
//chai.use(promised);
var expect = chai.expect;

//import UserService from './user.service';
import UserFixture from './user.fixtures';


//import rp from 'request-promise';

var url = 'http://localhost:5151';
var backend = 'http://localhost:52876/api/';
function getData(options) {
    return rp(options);
}

angular.module('app').run(function ($httpBackend) {
    console.log("hteouthoehtoe")
    $httpBackend.whenGET(/.*/).respond(()=>{
        console.log("GET!!!!")
        return [200, "jin"];
    });
})
describe("Service Testing", function(){

    beforeEach(angular.mock.module('app'));

    let UserService;
    beforeEach(inject((_UserService_)=>{
        UserService = _UserService_;
    }));
    describe.skip("UserGET", ()=>{
       var fetchedData;
        before(function(done){
            //var options = {
            //    uri: backend + "User/UserInfo",
            //    json: true
            //};
            //rp(options).then((body) => {
            //    fetchedData = body;
            //    done();
            //});
            done();
        });
        it("is success", function(){
           expect(fetchedData).to.not.be.false;
        });
    });
    describe("User:GetUser", ()=>{
        let UserData;
        before(function(done){
            UserService.getUser().then( (response)=>{
                console.log(response);
                UserData = response;
                done();
            }).catch((err)=>{
                console.log(err);
                done();
            });
            this.timeout(20000);
        });
        it("should fetch user", () => {
            expect(UserData).to.have.all.keys(UserFixture["UserInfo"]);
        });

    });

    it("should equal", function(){
        expect(2).to.equal(2);
    })
});