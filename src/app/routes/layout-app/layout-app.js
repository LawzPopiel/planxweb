'use strict';

import {RouteConfig} from '../../ng-decorators';  // jshint unused: false

//start-non-standard
@RouteConfig('app', {
    url: '',
    abstract: true,
    template: template,
    resolve: {
        user: UserService => UserService.getUser()
    }
})
//end-non-standard
class LayoutApp {}



/* .GULP-IMPORTS-START */ import './layout-app.includes.js';import template from './layout-app.html!text'; /* .GULP-IMPORTS-END */
