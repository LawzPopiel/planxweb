'use strict';

import fixture from './well-cleanout.fixtures';
import MockHttp from '../mock-http';
import {Run} from '../../ng-decorators'; // jshint unused: false

class WellCleanoutServiceMock extends MockHttp {
    //start-non-standard
    @Run()
    //end-non-standard
    runFactory($httpBackend, WellCleanoutService){
        var route = WellCleanoutService.getRoute();

        super.init($httpBackend, route, fixture);
    }
}


export default WellCleanoutServiceMock;
