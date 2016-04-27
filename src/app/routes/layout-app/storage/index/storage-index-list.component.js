'use strict';

import {Component, View} from '../../../../ng-decorators'; // jshint unused: false
import _ from 'lodash';
import AbstractList from '../../../../core/classes/AbstractList';
var StorageListIndex = 0;
//start-non-standard
@Component({
    selector: 'storage-index-list',
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
                        <td data-title="'Storage Facility #'" sortable="'StorageFacilityNumber'">{{row.StorageFacilityNumber}}</td>
                        <td data-title="'Transload Invoice #'" sortable="'InvoiceNumber'">{{row.InvoiceNumber}}</td>
                        <td data-title="'Delivery Ticket #'" sortable="'DeliveryTicketNumber'">{{row.DeliveryTicketNumber}}</td>
                        <td data-title="'Quantity Unloaded (lbs)'" sortable="'QuantityUnloadedPounds'">{{row.QuantityUnloadedPounds}}</td>
                        <td data-title="'Unit Price'" sortable="'UnitPrice'">{{row.UnitPrice | currency}}</td>
                        <td data-title="'Invoice Date'" sortable="'InvoiceDate'">{{row.InvoiceDate | date}}</td>
                        <td data-title="'Invoice Amount'" sortable="'InvoiceTotal'">{{row.InvoiceAmount | currency}}</td>
                        <td data-title="'Attachment'" sortable="'Attachment'">{{row.Attachment ? 'Y' : ''}}</td>
                        <td data-title="'Created On'" sortable="'CreatedOn'">{{row.CreatedOn | date}}</td>
                    </tr>
                    <tr>
                      <td colspan="5"></td>
                      <td style="text-align: right;">TOTAL: </td>
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

class StorageIndexList extends AbstractList {
    constructor(TransloadTrackingService, NgTableParams, $scope, $state){
        super(NgTableParams, $scope);
        this.SERVICE = TransloadTrackingService;
        this.$state = $state;
        this.clickedIndex = StorageListIndex;

    }
    getData(params) {
        return this.SERVICE.getList(params)
    }
    click(item){
        StorageListIndex = item.ID;
        this.$state.go('app.storage.index.edit', {id: item.ID});
    }
    afterLoad(serverData){
        this.invoiceTotalUp = 0;
        _.each(serverData, (item) =>{
            this.invoiceTotalUp += item.InvoiceAmount || 0;
        }, this);
    }

}

export default StorageIndexList;


/* .GULP-IMPORTS-START */ /* .GULP-IMPORTS-END */
