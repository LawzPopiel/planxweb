'use strict';

// js vendor files
import angular from 'angular';
import 'angular-animate';
import 'angular-sanitize';
import 'angular-messages';
import 'angular-ui-router';
import 'angular-ui/ui-bootstrap-tpls';
import 'angular-loading-bar';
import 'ng-table';
import 'lodash';
import 'angular-ui-bootstrap';
import 'angular-bootstrap-affix';
import 'angular-ui-grid';
import 'moment';
import 'ThirdCorner/angular-validator';
import 'ThirdCorner/scaffi-form-validator';

// css vendor files
//import 'font-awesome/css/font-awesome.css!';
//import 'github:fyockm/bootstrap-css-only/css/bootstrap.css!';

import mainModule from './ng-decorators';

// js app files
import './core/core';
import './directives/directives';
import './components/components';
import './routes/routes';
import './services/services';

import {HOMEPAGE} from './globals';

var requires = [
    // angular modules
    'ngAnimate',
    'ngMessages',
    'ngSanitize',

    // 3rd party modules lp added bootstap.affix and ui.grid
    'ui.router',
    'ui.bootstrap',
    'ui.grid',
    'mgcrea.bootstrap.affix',
    'ngTable',
    'angular-loading-bar',
    //'angularValidator',
    'scaffi-form-validator'
];


angular.element(document).ready(function() {
    angular.bootstrap(document, [mainModule.name], {
        //strictDi: true
    });
});

mainModule.requires = mainModule.requires.concat(requires);
mainModule.config( ($urlRouterProvider) => {
    // the `when` method says if the url is `/home` redirect to `/schedule` what is basically our `home` for this application
    $urlRouterProvider.when('/', HOMEPAGE);
});

mainModule.run((ngTableDefaults) =>{
    ngTableDefaults.params.count = 10;

    //Uncomment if you don't want tables to have a changable count
    // IE 10, 25, 50, 100
    ngTableDefaults.settings.counts = [10, 25, 50];

});

