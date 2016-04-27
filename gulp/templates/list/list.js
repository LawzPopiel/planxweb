'use strict';

import {Component, View} from '/app/ng-decorators'; // jshint unused: false

//start-non-standard
@Component({
    selector: '<%= name %>',
})
@View({
    template: `<table ng-table="vm.tableParams" class="table table-condensed list-table" ng-hide="vm.fetchingData || vm.rowCount == 0">
                    <tr ng-repeat="row in $data track by $index">
                        <td data-title="'ID'" sortable="'id'">{{row.id}}</td>
                        <td data-title="'Name'" sortable="'Name'">{{row.Name}}</td>
                        <td data-title="'Age'" sortable="'Age'">{{row.Age}}</td>
                    </tr>
                </table>
                <div ng-if="vm.rowCount == 0 || vm.fetchingData">
                    <div ng-if="vm.rowCount == 0 && !vm.fetchingData"><em>No results found.</em></div>
                    <div ng-if="vm.fetchingData"><i class="fa fa-spinner fa-spin"></i> <em>Fetching data...</em></div>
                </div>
                `,
    scope: {
        filters: "="
    }
})
//end-non-standard

class <%= className %> {
    constructor(<%= serviceName %>, NgTableParams, $scope){
        var that = this;
        this.fetchingData = true;
        if($scope.filters) {
            $scope.$watch('filters', ()=> {
                that.tableParams.filter($scope.filters);
                that.tableParams.reload();
            }, true);
        }

        this.tableParams = new NgTableParams({}, {
            getData: function (params) {
                that.fetchingData = true;
                return <%= serviceName %>.getList(params).then(function (data) {
                    params.total(data.inlineCount); // recal. page nav controls
                    that.rowCount = data.inlineCount;
                    that.fetchingData = false;
                    return data.results;
                });
            }
        });

    }

}

export default <%= className %>;


/* .GULP-IMPORTS-START */ /* .GULP-IMPORTS-END */