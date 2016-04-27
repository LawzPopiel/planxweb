'use strict';

import {RouteConfig} from 'app/ng-decorators';  // jshint unused: false

//start-non-standard
@RouteConfig('app.main-work', {
    url: '/main-work',
    template: "<ui-view></ui-view>",
    redirectTo: "app.main-work.index"
})
//end-non-standard
class MainWork {}

export default MainWork;
