'use strict';

import {RouteConfig, Component, View, Inject} from 'app/ng-decorators'; // jshint unused: false

/*
    !!! If you do something like this with the view, make it a directive instead.
     scope: false,
     transclude: true,
     bindToController: true,
     replace: true
*/

//start-non-standard
@Component({
    selector: 'weight-to-pounds',
})
@View({
    template: template,
    scope: {
        ngModel: "=",
        name: "@",
    }
})
//end-non-standard


class WeightToPounds {
    constructor($scope){
        this.amount = $scope.ngModel;
        this.weightType = "Pounds";
        this.types = ["Pounds", "Tons"];

        var that = this;
        $scope.$watch('vm.weightType', function(newValue, oldValue){
            if(typeof oldValue == "undefined") return;

            if(newValue != oldValue) {
                that.amount = null;
                $scope.ngModel = null;
            }

        });
        $scope.$watch('vm.amount', function(newValue, oldValue){
            if(typeof oldValue == "undefined") return;

            if(that.amount && that.weightType == "Tons") {
               $scope.ngModel = that.amount * 2000;
            } else {
               $scope.ngModel = that.amount;
            }

        });
    }

}

export default WeightToPounds;


/* .GULP-IMPORTS-START */ import template from './weight-to-pounds.html!text'; /* .GULP-IMPORTS-END */
