'use strict';

import {RouteConfig} from '../../../../ng-decorators'; // jshint unused: false
import _ from 'lodash';
import AbstractFilterList from 'app/core/classes/AbstractFilterList';

//start-non-standard
@RouteConfig('app.storage.index', {
    url: '/',
    template: template,
    data: {
        main: true,
    },
    resolve: {

    }
})
//end-non-standard


class StorageIndex extends AbstractFilterList {
    constructor($scope, $anchorScroll, AdminService){
        super();

        this.$scope = $scope;
        this.data = $scope.data;

        var that = this;

        that.StorageFacilities = [];
        AdminService.getStorageFacilities().then( facilities =>{
          _.each(facilities, facility =>{
            that.StorageFacilities.push(facility);
          });
        });

        $scope.changeState = (state) =>{
            if (!_.endsWith(state, "edit") && !_.endsWith(state, "add")) {
                that.search();
                $anchorScroll();
            } else {
                that.hideSearch();
                $anchorScroll("storage-form");

            }
        }
        $anchorScroll.yOffset = 50;
    }


}

export default StorageIndex;


/* .GULP-IMPORTS-START */ import template from './storage-index.html!text'; /* .GULP-IMPORTS-END */
