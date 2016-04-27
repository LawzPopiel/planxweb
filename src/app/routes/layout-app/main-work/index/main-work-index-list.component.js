'use strict';

import {Component, View} from 'app/ng-decorators'; // jshint unused: false
import AbstractList from 'app/core/classes/AbstractList';
var MainWorkListIndex = 0;
//start-non-standard
@Component({
    selector: 'main-work-index-list',
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
                        <td data-title="'Sand Supplier'">{{row.SandSupplierName}}</td>
                        <td data-title="'Invoice #'" sortable="'SandSupplierInvoiceNumber'">{{row.SandSupplierInvoiceNumber}}</td>
                        <td data-title="'BOL #'" sortable="'SandSupplierBOLNumber'">{{row.SandSupplierBOLNumber}}</td>
                        <td data-title="'PO #'" sortable="'SandSupplierPONumber'">{{row.SandSupplierPONumber}}</td>
                        <td data-title="'Freight BOL #'" sortable="'FreightVendorBOLNumber'">{{row.FreightVendorBOLNumber}}</td>
                        <td data-title="'Freight Invoice #'" sortable="'FreightVendorInvoiceNumber'">{{row.FreightVendorInvoiceNumber}}</td>
                        <td data-title="'Service Date'" sortable="'SandSupplierServiceDate'">{{row.SandSupplierServiceDate | date}}</td>
                        <td data-title="'Receive Date'" sortable="'SandSupplierReceivedDate'">{{row.SandSupplierReceiveDate | date}}</td>
                    </tr>
                </table>
                `,
    scope: {
        filters: "="
    }

})
//end-non-standard
class MainWorkIndexList extends AbstractList{
    constructor(MainWorkEntryService, NgTableParams, $scope, $state){
        super(NgTableParams, $scope);
        this.SERVICE = MainWorkEntryService;
        this.$state = $state;
        this.clickedIndex = MainWorkListIndex;

    }
    getData(params) {
        return this.SERVICE.getList(params)
    }
    click(item){
        MainWorkListIndex = item.ID;
        this.$state.go('app.main-work.index.edit', {id: item.ID});
    }


}

export default MainWorkIndexList;


/* .GULP-IMPORTS-START */ /* .GULP-IMPORTS-END */
