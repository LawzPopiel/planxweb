'use strict';

import {Component, View} from '../../../../ng-decorators'; // jshint unused: false
import AbstractList from '../../../../core/classes/AbstractList';
import _ from 'lodash';

var WellListIndex = 0;
//start-non-standard
@Component({
    selector: 'wells-index-list',
})
@View({
    template: `
                <div ng-if="vm.rowCount == 0 || vm.fetchingData">
                    <div ng-if="vm.rowCount == 0 && !vm.fetchingData"><em>No results found.</em></div>
                    <div ng-if="vm.fetchingData"><i class="fa fa-spinner fa-spin"></i> <em>Fetching data...</em></div>
                </div>
                <div ng-if="vm.error">
                    <div class="error" style="color: darkred;"><em>Error fetching data!</em></div>
                </div>
                <table ng-table="vm.tableParams" class="table table-condensed list-table" ng-hide="vm.fetchingData || vm.rowCount == 0 || vm.error">
                    <tr ng-repeat="row in $data track by $index" ng-click="vm.click(row)" ng-class="{'active': vm.clickedIndex === row.ID}">
                        <td data-title="'Cleanout BOL#'" sortable="'CleanoutBOLNumber'">{{row.CleanoutBOLNumber}}</td>
                        <td data-title="'Vendor Name'" sortable="'FreightVendor'">{{row.FreightVendor}}</td>
                        <td data-title="'Delivery Ticket #'" sortable="'FreightDeliveryTicketNumber'">{{row.FreightDeliveryTicketNumber}}</td>
                        <td data-title="'Truck #'" sortable="'FreightCompanyTruckNumber'">{{row.FreightCompanyTruckNumber}}</td>
                        <td data-title="'Invoice Date'">{{row.InvoiceDate | date}}</td>
                        <td data-title="'Freight Amount'">{{row.DollarAmount | currency}}</td>
                        <td data-title="'Invoice Amount'">{{row.InvoiceAmount | currency}}</td>
                        <td data-title="'Miles'">{{row.Miles}}</td>
                        <td data-title="'Diversion'">{{row.Diversion ? '+' : ''}}</td>
                        <td data-title="'Ship Date'">{{row.ShipDate | date}}</td>
                    </tr>
                    <tr>
                      <td colspan="4"></td>
                      <td style="text-align: right;">TOTAL: </td>
                      <td style="font-weight: bold;">{{vm.freightTotalUp | currency}}</td>
                      <td style="font-weight: bold;">{{vm.invoiceTotalUp | currency}}</td>
                      <td colspan="2"></td>

                    </tr>
                </table>
                `,
    scope: {
        filters: "="
    }
})
//end-non-standard

class WellsIndexList extends AbstractList {
    constructor(WellCleanoutService, NgTableParams, $scope, $state){
        super(NgTableParams, $scope);
        this.SERVICE = WellCleanoutService;
        this.$state = $state;
        this.clickedIndex = WellListIndex;


    }
    getData(params) {
        return this.SERVICE.getList(params)
    }
    click(item){
        WellListIndex = item.ID;
        this.$state.go('app.wells.index.edit', {id: item.ID});
    }
    afterLoad(serverData){
        this.invoiceTotalUp = 0;
        this.freightTotalUp = 0;
        _.each(serverData, (item) =>{
            this.invoiceTotalUp += item.InvoiceAmount || 0;
            this.freightTotalUp += item.DollarAmount || 0;
        }, this);
    }
}

export default WellsIndexList;


/* .GULP-IMPORTS-START */ /* .GULP-IMPORTS-END */
