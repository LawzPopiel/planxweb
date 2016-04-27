'use strict';


import {RouteConfig, Component, Directive, View, Inject} from './ng-decorators'; // jshint unused: false

//start-non-standard
@Directive({
    selector: 'form-validator',

})
//end-non-standard


class FormValidator {
    constructor() {
        this.scope = false;
        this.transclude = true;
        this.replace = true;
        this.restrict = "E";
        this.template = "<form novalidate angular-validator angular-validator-submit='angularSubmit()' modal-unsaved-changes ng-transclude></form>";

    }

    link(scope, element, attrs, formCtrl){
        if(!attrs.onSubmit) {
            throw new Error("You need to provide a 'on-submit' attribute for your form.")
        }
        if(!attrs.name) {
            throw new Error("You need to provide a 'name' attribute for your form.")
        }
		if(attrs.name.indexOf("-") !== -1) {
            throw new Error("Your form name cannot have dashes. Use camel case.")
        }
        scope.angularSubmit = function(){
            scope[attrs.name].$setPristine();
            scope.$eval(attrs.onSubmit);
        }
    }

    static directiveFactory(){
        FormValidator.instance = new FormValidator();
        return FormValidator.instance;
    }
}

export default FormValidator;

