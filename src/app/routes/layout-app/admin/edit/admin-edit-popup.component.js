'use strict';

import {Service} from '../../../../ng-decorators'; // jshint unused: false
@Service({
    serviceName: 'AdminEditPopupService'
})
class AdminEditPopup {
    constructor($uibModal){
        this.$uibModal = $uibModal;

    }

    launch(editItem) {
        var that = this;

        var modalInstance = this.$uibModal.open({
            animation: true,
            template:  this.getTemplate(),
            controller: ($scope, $uibModalInstance) =>{
                $scope.editItem = angular.copy(editItem);
                $scope.editItem.IsActive = true;
                $scope.ok = ()=>{
                    console.log("subit")
                    $uibModalInstance.close($scope.editItem);
                };

                $scope.cancel = () => {
                    $uibModalInstance.dismiss('cancel');
                };
            },
            size: 'md',

        });

        return modalInstance.result;
    }

    getTemplate(){
        return `
        <form-validator name="additem" on-submit="ok()">
            <div class="modal-header">
                <h1 class="modal-title">Add Item</h1>
            </div>
            <div class="modal-body">
                <div class="row">
                    <div class="form-group col-xs-6">
                        <label class="control-label">Display</label>
                    </div>
               </div>
               <div class="row">
                   <div class="form-group col-xs-6">
                       <input type="text" class="form-control" name="add-display" ng-model="editItem.Name" required />
                   </div>
               </div>

            </div>
            <div class="modal-footer">
                <button class="btn btn-primary" type="submit">Submit</button>
                <button class="btn btn-default" type="button" ng-click="cancel()">Cancel</button>
            </div>
        </form-validator>
        `;
    }
}

export default AdminEditPopup;


/* .GULP-IMPORTS-START */ /* .GULP-IMPORTS-END */
