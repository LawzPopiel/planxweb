'use strict';

import AbstractService from '../abstract-service';
import {Service, Inject} from '../../ng-decorators'; // jshint unused: false

//start-non-standard
@Service({
    serviceName: 'WellCleanoutService'
})
//end-non-standard
class WellCleanoutService extends AbstractService {
    constructor($http, $state, $rootScope, UserService) {
        super($http, 'WellToWell', $state, $rootScope, UserService);

    }

}

export default WellCleanoutService;
