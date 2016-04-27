'use strict';

import {RouteConfig} from '../../../ng-decorators';  // jshint unused: false

//start-non-standard
@RouteConfig('app.wells', {
    url: '/wells',
    template: "<ui-view></ui-view>",
    redirectTo: "app.wells.index"
})
//end-non-standard
class Wells {}

export default Wells;
