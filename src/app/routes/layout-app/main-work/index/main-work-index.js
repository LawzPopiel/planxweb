'use strict';

import {RouteConfig} from 'app/ng-decorators'; // jshint unused: false
import _ from 'lodash';
import AbstractFilterList from 'app/core/classes/AbstractFilterList';

//start-non-standard
@RouteConfig('app.main-work.index', {
    url: '/',
    template: template,
    resolve: {
        SandSuppliers: (AdminService) => AdminService.getSandSuppliers(),
        FreightVendors: (AdminService) => AdminService.getFreightVendors(),
    }
})
//end-non-standard


class MainWorkIndex extends AbstractFilterList {
    constructor(SandSuppliers, FreightVendors, $scope, $anchorScroll){

        super();
        this.SandSuppliers = SandSuppliers;
        this.FreightVendors = FreightVendors;

        this.$scope = $scope;

        var that = this;
        $scope.changeState = (state) =>{
            if (!_.endsWith(state, "edit")) {
                that.search();
                $anchorScroll();
            } else {
                that.hideSearch();


            }
        }
        $anchorScroll.yOffset = 50;

    }


}

export default MainWorkIndex;


/* .GULP-IMPORTS-START */ import template from './main-work-index.html!text'; /* .GULP-IMPORTS-END */
