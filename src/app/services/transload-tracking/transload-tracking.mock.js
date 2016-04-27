'use strict';

import fixture from './transload-tracking.fixtures';
import MockHttp from '../mock-http';
import {Run} from '../../ng-decorators'; // jshint unused: false

class TransloadTrackingServiceMock extends MockHttp {
    //start-non-standard
    @Run()
    //end-non-standard
    runFactory($httpBackend, TransloadTrackingService){
        var route = TransloadTrackingService.getRoute();

        super.init($httpBackend, route, fixture);
    }
}


export default TransloadTrackingServiceMock;
