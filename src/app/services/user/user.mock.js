'use strict';

import fixture from './user.fixtures';
import MockHttp from '../mock-http';
import {Run} from '../../ng-decorators'; // jshint unused: false

class UserServiceMock extends MockHttp {
    //start-non-standard
    @Run()
    //end-non-standard
    runFactory($httpBackend, UserService){
        var route = UserService.getRoute();

        super.init($httpBackend, route, fixture);
    }
}


export default UserServiceMock;
