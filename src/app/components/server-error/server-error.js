'use strict';

import {RouteConfig, Service, Component, View, Inject} from 'app/ng-decorators'; // jshint unused: false
import _ from "lodash";

/*
    !!! If you do something like this with the view, make it a directive instead.
     scope: false,
     transclude: true,
     bindToController: true,
     replace: true
*/
//start-non-standard
@Component({
    selector: 'server-error',
})
@View({
    template: template,
    // If you need certain variables passed in, uncomment scope here
    //scope: {}
})
//end-non-standard


class ServerError {
    constructor($rootScope, $state){
        this.show = false;
        this.$state = $state;

        var that = this;
        $rootScope.showResourceError = (response)=>{
            if(response && response.status == -1) {
                return response;
            }
            return that.showInfo(response);
        };
        $rootScope.showServerError = (response)=>{
            if(response && response.status == -1) {
                return response;
            }
            return that.showPopup(response);
        };
        $rootScope.hideServerPopup = ()=>{
            return that.hidePopup();
        };
    }
    dismiss(){
        console.log("dismiss")
        this.hidePopup();
    }
    showInfo(response){
        //console.log("=================== INFO =================");
        //console.log(response);
        //console.log("==========================================");

        if(response && response.status != 404) {
            this.showErrorPopup(response);
        }
    }
    showPopup(response){
        if(response && response.status == 404) {
            this.$state.go("404");
            return;
        }

        this.showErrorPopup(response);
        //this.$state.go("500");
    }
    showErrorPopup(response){
        this.show = true;
        this.error = {};
        _.each(response.data, function(value, name){
            this.error[name] = value;

            try {
                this.error[name] = JSON.decode(value)
            } catch(e){}

        }, this);

        this.error.statusCode = response.status;


        var response = this.error.response ? this.error.response : null;
        try {
            response = JSON.parse(response);

        } catch(e){}

        var preData = angular.copy(this.error);
        preData["response"] = response;

        preData = JSON.stringify(preData, true);
        this.error.pre = preData;

    }
    hidePopup(){
        this.error = null;
        this.show = false;
        this.$state.go(this.$state.current, {}, {reload: true});
    }

}

export default ServerError;


/* .GULP-IMPORTS-START */ import template from './server-error.html!text'; /* .GULP-IMPORTS-END */
