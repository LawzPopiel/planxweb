'use strict';

import fixture from './<%= name %>.fixtures';
import MockHttp from '../mock-http';
import {Run} from '../../ng-decorators'; // jshint unused: false

class <%= className %>Mock extends MockHttp {
    //start-non-standard
    @Run()
    //end-non-standard
    runFactory($httpBackend, <%= className %>){
        var route = <%= className %>.getRoute();

        super.init($httpBackend, route, fixture);
    }
}


export default <%= className %>Mock;