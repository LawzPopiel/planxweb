'use strict';

import AbstractService from '../abstract-service';
import {Service} from '../../ng-decorators'; // jshint unused: false

//start-non-standard
@Service({
    serviceName: 'UserService'
})
//end-non-standard
class UserService extends AbstractService {
    constructor($http, $state, $rootScope) {
        super($http, 'User/UserInfo', $state, $rootScope);

    }

    getUsername(){
        return this.user.PioneerID;
    }
    getUser(){
        var that = this;
        return new Promise( (resolve, reject)=>  {
            if(!that.user) {
                return that.get().then( user => {
                    if(!user.PioneerID) {
                        user.PioneerID = "test123";
                        user.Name = "Test User";
                    }
                    that.user = user;
                    resolve(user);

                });
            } else  {
                resolve(that.user);
            }

        });

    }
}

export default UserService;
