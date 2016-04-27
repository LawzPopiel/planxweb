'use strict';

import AbstractService from '../abstract-service';
import {Service, Inject} from '../../ng-decorators'; // jshint unused: false

//start-non-standard
@Service({
    serviceName: 'TransloadTrackingService'
})
//end-non-standard
class TransloadTrackingService extends AbstractService {
    constructor($http, $state, $rootScope, UserService) {
        super($http, 'Transload', $state, $rootScope, UserService);

    }


}

export default TransloadTrackingService;
