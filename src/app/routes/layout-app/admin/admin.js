'use strict';

import {RouteConfig} from '../../../ng-decorators';  // jshint unused: false

//start-non-standard
@RouteConfig('app.admin', {
    url: '/admin',
    template: "<ui-view></ui-view>",
    redirectTo: "app.admin.index"
})
//end-non-standard
class Admin {}

export default Admin;
