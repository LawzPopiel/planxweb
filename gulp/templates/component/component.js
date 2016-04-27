'use strict';

import {RouteConfig, Component, View, Inject} from '../../ng-decorators'; // jshint unused: false

/*
    !!! If you do something like this with the view, make it a directive instead.
     scope: false,
     transclude: true,
     bindToController: true,
     replace: true
*/

//start-non-standard
@Component({
    selector: '<%= name %>',
})
@View({
    template: template,
    // If you need certain variables passed in, uncomment scope here
    //scope: {}
})
//end-non-standard


class <%= className %> {
    constructor(){

    }

}

export default <%= className %>;


/* .GULP-IMPORTS-START */ import template from './<%= name %>.html!text'; /* .GULP-IMPORTS-END */