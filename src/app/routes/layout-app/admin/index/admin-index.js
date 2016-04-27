'use strict';

import {RouteConfig} from '../../../../ng-decorators'; // jshint unused: false

//start-non-standard
@RouteConfig('app.admin.index', {
    url: '/',
    template: template,
    resolve: {
        DropdownItems: (AdminService) => AdminService.getList()
    }
})
//end-non-standard


class AdminIndex {
    constructor(DropdownItems){
        this.DropdownItems = DropdownItems;
    }

}

export default AdminIndex;


/* .GULP-IMPORTS-START */ import template from './admin-index.html!text'; /* .GULP-IMPORTS-END */
