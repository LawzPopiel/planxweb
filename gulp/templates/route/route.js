'use strict';

import {RouteConfig} from '/app/ng-decorators'; // jshint unused: false

//start-non-standard
@RouteConfig('app.<%= path %>', {
    url: '<%= urlName %>',
    template: template,
    resolve: {

    }
})
//end-non-standard


class <%= className %> {
    constructor(){

    }

}

export default <%= className %>;


/* .GULP-IMPORTS-START */ import template from './<%= filename %>.html!text'; /* .GULP-IMPORTS-END */