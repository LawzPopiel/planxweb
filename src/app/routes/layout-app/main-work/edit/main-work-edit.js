'use strict';

import {RouteConfig} from '../../../../ng-decorators'; // jshint unused: false
import _ from 'lodash';
import moment from 'moment';

//start-non-standard
@RouteConfig('app.main-work.index.edit', {
    url: ':id/edit',
    template: template,
    resolve: {
        editItem: (MainWorkEntryService, $stateParams) => MainWorkEntryService.get($stateParams.id),
        user: (UserService) => UserService.get(),
        WellNames: (AdminService)=> AdminService.getWellNames()
    }
})
//end-non-standard


class MainWorkEdit {
    constructor(editItem, $scope, AdminService, MainWorkEntryService, user, $state, WellNames, $anchorScroll){
        this.editItem = editItem;
        $anchorScroll("main-form");

        this.lockDiversion = false;
        if(this.editItem.Diversion) {

            this.lockDiversion = true;
        }

        this.WellNames = WellNames;

        // Set User Variables
        editItem.ModifiedBy = user.PioneerID;

        if(!editItem.FreightVendors) {
            editItem.FreightVendors = [
                {}
            ];
        } else {
        }
        var resources = ["SandSuppliers", "FreightVendors", "MeshSizes", "AssetTeams", "FleetDepartmentCodes", "StorageFacilities" ]
        _.each(resources, function(name){
            this[name] = [];
            var fnName = "get" + name;
            AdminService[fnName]().then( (results) => {
                _.each(results, (item) => this[name].push(item));
            })
        }, this);

        var that = this;
        // Add SandSupplier.InvoiceAmount
        $scope.$watchGroup(["vm.editItem.SandSupplier.WeightInPounds","vm.editItem.SandSupplier.PricePerPound","vm.editItem.SandSupplier.EnergySurcharge"], function(){
            if(that.editItem.SandSupplier) {
                var pounds = that.editItem.SandSupplier.WeightInPounds || 0;
                var poundPrice = that.editItem.SandSupplier.PricePerPound || 0;
                var surcharge = that.editItem.SandSupplier.EnergySurcharge || 0;

                that.editItem.SandSupplier.InvoiceAmount = (pounds * poundPrice) + surcharge || 0;
            }
        });

        this.service = MainWorkEntryService;
        this.$state = $state;
    }
    toggleDiversion(){
        if(this.editItem.Diversion) {
            this.editItem.FreightVendors.push({});
        } else {
            this.editItem.FreightVendors.pop();
        }
    }

    calculateFreightInvoiceAmount(freight) {
        if(freight) {
            var dollarAmount = freight.FreightDollarAmount || 0;
            var surcharge = freight.FuelSurchargeAmount || 0;
            var detention = freight.DetentionRate || 0;
            var detentionhrs = freight.DetentionHours || 0;
            var other = freight.OtherMiscCharges || 0;

            freight.InvoiceAmount = dollarAmount + surcharge + (detention * detentionhrs) + other;
        }
    }
    validateShipDate(){
      if(!this.editItem.SandSupplier.ShipDate) {
        return true;
      }

      return this.editItem.SandSupplier.ShipDate <= moment().endOf("day").toDate() ? true : false;
    }
    submit(){
       this.service.update(this.editItem).then(() => this.$state.go("app.main-work"));
    }
}

export default MainWorkEdit;


/* .GULP-IMPORTS-START */ import template from './main-work-edit.html!text'; /* .GULP-IMPORTS-END */
