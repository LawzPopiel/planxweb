'use strict';

import template from './header.html!text';
import {View, Component, Inject} from 'app/ng-decorators'; // jshint unused: false

//start-non-standard
@Component({
    selector: 'header'
})
@View({
    template: template,
})
//end-non-standard
class Header {
    constructor($state, UserService) {
        this.router = $state;
        var that = this;
        UserService.getUser().then( user =>{
            console.log(user)
           that.user = user;
        });
    }

    logout() {
    }
}

export default Header;
