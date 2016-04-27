'use strict';

import {RouteConfig} from '/app/ng-decorators';  // jshint unused: false

//start-non-standard
@RouteConfig('app.<%= path %>', {
    url: '/<%= name %>',
    template: "<ui-view></ui-view>",
    redirectTo: "app.<%= path %>.index"
})
//end-non-standard
class <%= className %> {}

export default <%= className %>;
