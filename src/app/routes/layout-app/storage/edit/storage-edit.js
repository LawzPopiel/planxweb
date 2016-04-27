'use strict';

import {RouteConfig} from '../../../../ng-decorators'; // jshint unused: false
import _ from 'lodash';

import {ID_PROP} from 'app/globals';


//start-non-standard
@RouteConfig('app.storage.index.edit', {
    url: ':id/edit',
    template: template,
    resolve: {
        editItem: (TransloadTrackingService, $stateParams) => TransloadTrackingService.get($stateParams.id),
        user: (UserService) => UserService.getUser()

    }
})
@RouteConfig('app.storage.index.add', {
    url: 'add',
    template: template,
    resolve: {
        editItem: () => {
            return {};
        },
        user: (UserService) => UserService.get()
    }
})
//end-non-standard


class StorageEdit {
    constructor(editItem, user, AdminService, TransloadTrackingService, $scope, $state){

        this.editItem = editItem;

        if(_.isArray(this.editItem)) {
            this.editItem = this.editItem.shift();
        }
        editItem.ModifiedBy = user.PioneerID;
        if(!editItem[ID_PROP]) {
            editItem.CreatedBy = user.PioneerID;
        }

        var that = this;
        that.MeshSizes = [];
        that.StorageFacilities = [];

        AdminService.getStorageFacilities().then( facilities =>{
            _.each(facilities, facility =>{
              that.StorageFacilities.push(facility);
            });
        });
        AdminService.getMeshSizes().then( (meshes) =>{
            _.each(meshes, (value)=>{
               that.MeshSizes.push(value);
            });
        });

        this.service = TransloadTrackingService;
        this.$state = $state;

        // Add InvoiceAmount
        $scope.$watchGroup(["vm.editItem.QuantityUnloadedPounds", "vm.editItem.UnitPrice" ], function(){
           if(editItem) {
               var tons = (editItem.QuantityUnloadedPounds / 2000) || 0;
               var unitPrice = editItem.UnitPrice || 0;

               editItem.InvoiceAmount = tons * unitPrice;
           }
        });
        $scope.$watch("vm.editItem.QuantityUnloadedPounds", function(){


            //editItem.QuantityUnloadedTons = editItem.QuantityUnloadedPounds / 2000;
            //editItem.QuantityUnloadedCwt = editItem.QuantityUnloadedPounds / 100;
        });
    }

    submit(){
        this.service.submit(this.editItem).then(() => this.$state.go("app.storage"));
    }
}

export default StorageEdit;


/* .GULP-IMPORTS-START */ import template from './storage-edit.html!text'; /* .GULP-IMPORTS-END */
