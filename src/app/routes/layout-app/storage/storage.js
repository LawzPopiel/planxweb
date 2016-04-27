'use strict';

import {RouteConfig} from '../../../ng-decorators';  // jshint unused: false

//start-non-standard
@RouteConfig('app.storage', {
    url: '/storage',
    template: "<ui-view></ui-view>",
    redirectTo: "app.storage.index"
})
//end-non-standard
class Storage {}

export default Storage;
