'use strict';

import fixture from './admin.fixtures';
import MockHttp from '../mock-http';
import {Run} from '../../ng-decorators'; // jshint unused: false

class AdminServiceMock extends MockHttp {
    //start-non-standard
    @Run()
    //end-non-standard
    runFactory($httpBackend, AdminService){
        var route = AdminService.getRoute();

        var overrides = {
            "LIST": (method, url, data, headers) => {
                return [200, fixture.COLLECTION];

            }
        };


        super.init($httpBackend, route, fixture, overrides);


        //super.getHttpList($httpBackend).respond( (method, url, data, headers) =>{
        //        console.log("list")
        //        super.sendData(200, fixture.COLLECTION, headers);
        //    });
    }
}


export default AdminServiceMock;
