'use strict';

import template from './modal-unsaved-changes.html!text';
import {Service, Inject, Directive} from '../../ng-decorators'; // jshint unused: false

//start-non-standard
@Service({
    serviceName: 'UnsavedFormsService'
})
//end-non-standard
class UnsavedFormsService {
    constructor() {
        this.forms = [];
    }

    add(form) {
        this.forms.push(form);
    }

    remove(form) {
        const index = this.forms.indexOf(form);

        this.forms.splice(index, 1);
    }

    areFormsClean() {
        let areAllFormsClean = true;
        let clonedArray = this.forms.slice(0);

        for(let form of clonedArray) {
            // `true` if user has already interacted with the form
            if (form.$dirty) {
                areAllFormsClean = false;
            } else {
                // remove any non dirty form from `forms` array
                this.remove(form);
            }
        }

        return areAllFormsClean;
    }
}

const MODAL = new WeakMap();
const STATE = new WeakMap();
const SERVICE = new WeakMap();

//start-non-standard
@Directive({
    selector: 'modal-unsaved-changes'
})
//end-non-standard

class ModalUnsavedChanges {
    constructor($uibModal , $state, UnsavedFormsService){
        this.require = '^form';
        this.restrict = 'A';
        this.scope = {
            resetForm: '&modalUnsavedChanges'
        };
        MODAL.set(this, $uibModal);
        STATE.set(this, $state);
        SERVICE.set(this, UnsavedFormsService);
    }

    link(scope, element, attrs, formCtrl) { // jshint unused: false
        SERVICE.get(ModalUnsavedChanges.instance).add(formCtrl);
        var modalOpen = false;
        const onRouteChangeOff = scope.$on('$stateChangeStart', function(event, toState) { // jshint unused: false

            if (!SERVICE.get(ModalUnsavedChanges.instance).areFormsClean() && !modalOpen) {

                // Because the statechange fires twice if the route doesn't declare params, this is meant to surpress it
                modalOpen = true;
                MODAL.get(ModalUnsavedChanges.instance).open({
                    template: template,
                    controller: ['$uibModalInstance', '$state', function($uibModalInstance, $state) {
                        var vm = this;

                        vm.ok = () => {
                            $uibModalInstance.close();
                            onRouteChangeOff(); // stop listening for location changes
                            $state.go(toState.name);
                            SERVICE.get(ModalUnsavedChanges.instance).remove(formCtrl);
                            scope.resetForm(); // reset form scope
                        };

                        vm.cancel = () => {
                            modalOpen = false;
                            $uibModalInstance.dismiss('cancel');
                        }
                    }],
                    controllerAs: 'vm'
                });

                // prevent navigation by default since we'll handle it
                // once the user selects a dialog option
                event.preventDefault();
            }
        });
    }

    static directiveFactory($uibModal, $state, UnsavedFormsService){
        ModalUnsavedChanges.instance = new ModalUnsavedChanges($uibModal, $state, UnsavedFormsService);
        return ModalUnsavedChanges.instance;
    }
}

export default ModalUnsavedChanges;
