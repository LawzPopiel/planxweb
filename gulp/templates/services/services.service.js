'use strict';

import AbstractService from '../abstract-service';
import {Service, Inject} from '../../ng-decorators'; // jshint unused: false

//start-non-standard
@Service({
    serviceName: '<%= className %>'
})
//end-non-standard
class <%= className %> extends AbstractService {
    constructor($http, $state) {
        super($http, '<%= apiName %>', $state);

    }


}

export default <%= className %>;
