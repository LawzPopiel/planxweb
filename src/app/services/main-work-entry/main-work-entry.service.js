'use strict';

import AbstractService from '../abstract-service';
import {Service, Inject} from '../../ng-decorators'; // jshint unused: false

//start-non-standard
@Service({
    serviceName: 'MainWorkEntryService'
})
//end-non-standard
class MainWorkEntryService extends AbstractService {
    constructor($http, $state, $rootScope, UserService) {
        super($http, 'MainWorkEntry', $state, $rootScope, UserService);

    }


}

export default MainWorkEntryService;
