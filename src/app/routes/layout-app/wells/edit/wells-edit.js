'use strict';

import {RouteConfig} from '../../../../ng-decorators'; // jshint unused: false
import _ from 'lodash';
import moment from 'moment';

import {ID_PROP} from 'app/globals';

//start-non-standard
@RouteConfig('app.wells.index.edit', {
    url: ':id/edit',
    template: template,
    resolve: {
        editItem: (WellCleanoutService, $stateParams) => WellCleanoutService.get($stateParams.id),
        user: (UserService) => UserService.getUser(),
        WellNames: (AdminService)=> AdminService.getWellNames()
    }
})
@RouteConfig('app.wells.index.add', {
    url: 'add',
    template: template,
    resolve: {
        editItem: () => {
            return {};
        },
        user: (UserService) => UserService.getUser()
    }
})
//end-non-standard


class WellsEdit {
    constructor(editItem, user, WellCleanoutService, AdminService, $state, $scope, WellNames){
        this.editItem = editItem;

        if(_.isArray(this.editItem)) {
            this.editItem = this.editItem.shift();
        }


        this.WellNames = WellNames;

        editItem.ModifiedBy = user.PioneerID;
        if(!editItem[ID_PROP]) {
            editItem.CreatedBy = user.PioneerID;
        }

        var resources = ["FreightVendors", "AssetTeams", "FleetDepartmentCodes", "MeshSizes"];
        _.each(resources, function(name){
            this[name] = [];
            var fnName = "get" + name;
            AdminService[fnName]().then( (results) => {
                _.each(results, (item) => this[name].push(item));
            })
        }, this);

        this.service = WellCleanoutService;
        this.$state = $state;

        $scope.$watchGroup(["vm.editItem.DollarAmount", "vm.editItem.SurchargeDollarAmount","vm.editItem.DetentionRate", "vm.editItem.DetentionHours", "vm.editItem.OtherMiscCharges", ], function(){
           if(editItem) {
               var dollars = editItem.DollarAmount || 0;
               var surcharge = editItem.SurchargeDollarAmount || 0;
               var detention = editItem.DetentionRate || 0;
               var detentionhrs = editItem.DetentionHours || 0;
               var other = editItem.OtherMiscCharges || 0;

               editItem.InvoiceAmount = dollars + surcharge + (detention * detentionhrs) + other;
           }
        });

        $scope.$watch("vm.editItem.WeightPounds", function(){

            editItem.WeightTons = editItem.WeightPounds / 2000;
            editItem.WeightCwt = editItem.WeightPounds / 100;
        });
    }

    validateShipDate(){
      if(!this.editItem.ShipDate) {
        return true;
      }

      return this.editItem.ShipDate <= moment().endOf("day").toDate() ? true : false;
    }
    submit(){

        this.service.submit(this.editItem).then(() => this.$state.go("app.wells"));
    }
}

export default WellsEdit;


/* .GULP-IMPORTS-START */ import template from './wells-edit.html!text'; /* .GULP-IMPORTS-END */
