'use strict';
import _ from 'lodash';
import {RouteConfig, Component, View, Inject} from 'app/ng-decorators'; // jshint unused: false
import {API_BASE} from 'app/globals';
/*
    !!! If you do something like this with the view, make it a directive instead.
     scope: false,
     transclude: true,
     bindToController: true,
     replace: true
*/

//start-non-standard
@Component({
    selector: 'test-ui-harness',
})
@View({
    template: template,
    // If you need certain variables passed in, uncomment scope here
    //scope: {}
})
//end-non-standard


class TestUiHarness {
    constructor($rootScope){
        var that = this;
        this.responses = null;
        $rootScope.addTestUIHarnessResponse = (response)=>{
            that.addResponse(response);
        }
        //this.startWatching();
    }
    addResponse(response){
        console.log(response);
        if(this.watching) {
            var setResp = {};
            if(response.config) {
                setResp.type = response.config.method;
                setResp.url = _.isString(response.config.url) ? response.config.url.substr(API_BASE.length) : "";

            }
            if(response.status < 200 || response.status > 299) {
                setResp.error = true;
            }
            if(response.data) {
                setResp.data = response.data;
                try {
                    setResp.data = JSON.stringify(response.data);
                } catch (e) {
                }
            }
            this.responses.push(setResp);
        }
    }

    startWatching() {
        this.responses = [];
        this.watching = true;
    }
    stopWatching(){
        this.watching = false;
    }

}

export default TestUiHarness;


/* .GULP-IMPORTS-START */ import template from './test-ui-harness.html!text'; /* .GULP-IMPORTS-END */
