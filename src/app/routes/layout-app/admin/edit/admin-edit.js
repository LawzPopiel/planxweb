'use strict';

import {RouteConfig} from '../../../../ng-decorators'; // jshint unused: false
import _ from 'lodash';


//start-non-standard
@RouteConfig('app.admin.edit', {
    url: '/:id/edit',
    template: template,
    resolve: {
        editItem: (AdminService, $stateParams) => AdminService.get($stateParams.id),
    }
})
//end-non-standard


class AdminEdit {
    constructor(editItem, $modal, AdminService, $state, AdminEditPopupService){
        this.editItem = editItem;
        this.service = AdminService;
        this.$state = $state;

        this.showInactives = false;
        this.AdminEditPopupService = AdminEditPopupService;
    }

    addItem(){
        this.AdminEditPopupService.launch({}).then( (addItem)=>{
            this.editItem.ListOptions.push(addItem);
        });
    }

    submit(){

        this.service.update(this.editItem).then(() => this.$state.go("app.admin"));
    }
    hasActiveItem(){
        var hasActiveItem = false;
        _.each(this.editItem.ListOptions, function(value){
           if(value.IsActive) {
               hasActiveItem = true;
           }

        });

        return hasActiveItem;
    }
}

export default AdminEdit;


/* .GULP-IMPORTS-START */ import template from './admin-edit.html!text'; /* .GULP-IMPORTS-END */
