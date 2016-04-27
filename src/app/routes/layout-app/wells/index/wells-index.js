'use strict';

import {RouteConfig} from 'app/ng-decorators'; // jshint unused: false
import _ from 'lodash';
import AbstractFilterList from 'app/core/classes/AbstractFilterList'

//start-non-standard
@RouteConfig('app.wells.index', {
    url: '/',
    template: template,
    resolve: {
        WellNames: (AdminService) => AdminService.getWellNames()
    }
})
//end-non-standard


class WellsIndex extends AbstractFilterList{
    constructor(WellNames, $scope, $anchorScroll){
        super();
        this.WellNames = WellNames;


        this.$scope = $scope;

        var that = this;
        $scope.changeState = (state) =>{

            if (!_.endsWith(state, "edit") && !_.endsWith(state, "add")) {
                that.search();
                $anchorScroll();
            } else {
                that.hideSearch();
                $anchorScroll("wells-form");

            }
        }
        $anchorScroll.yOffset = 50;
    }


}

export default WellsIndex;


/* .GULP-IMPORTS-START */ import template from './wells-index.html!text'; /* .GULP-IMPORTS-END */
