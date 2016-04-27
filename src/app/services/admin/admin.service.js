'use strict';

import AbstractService from '../abstract-service';
import {Service, Inject} from '../../ng-decorators'; // jshint unused: false
import _ from 'lodash';
import fixture from './admin.fixtures';
//start-non-standard
@Service({
    serviceName: 'AdminService'
})
//end-non-standard
class AdminService extends AbstractService {
    constructor($http, $state, $rootScope, UserService) {
        super($http, 'admin/ListManagement', $state, $rootScope, UserService);

    }
    getList(){
        return new Promise( (resolve, reject) => {
            var list = [
                {ID: "1", Phase: "MOB", Name: "Move", CumDays:"0"},
                {ID: "2", Phase: "MOB", Name: "Rig Up (Incl Skid)", CumDays:"0"},
                {ID: "3", Phase: "Surf", Name: "Pre Drill",CumDays:"0" },
                {ID: "4", Phase: "Surf", Name: "Drill", CumDays:"0"},
                {ID: "5", Phase: "Surf", Name: "Post Drill",CumDays:"0" },
                {ID: "6", Phase: "Surf", Name: "Case & Cmnt", CumDays:"0"},
                {ID: "7", Phase: "Int1", Name: "Pre Drill", CumDays:"0" },
                {ID: "8", Phase: "Int1", Name: "Post Drill", CumDays:"0"},
                {ID: "9", Phase: "Int1", Name: "Eval", CumDays:"0"},
                {ID: "10", Phase: "Int1", Name: "Case & Cmnt", CumDays:"0"},
                {ID: "11", Phase: "Int2", Name: "Pre Drill", CumDays:"0"},
                {ID: "12", Phase: "Int2", Name: "Drill Vert", CumDays:"0"},
                {ID: "13", Phase: "Int2", Name: "Post Drill", CumDays:"0"}
                
            ];

            resolve(list);
        });
    }
    
    
    getTableData(){
        return new Promise( (resolve, reject) => {
            var tabDat = [
    {
        "firstName": "Cox",
        "lastName": "Carney",
        "company": "Enormo",
        "employed": true
    },
    {
        "firstName": "Lorraine",
        "lastName": "Wise",
        "company": "Comveyer",
        "employed": false
    },
    {
        "firstName": "Nancy",
        "lastName": "Waters",
        "company": "Fuelton",
        "employed": false
    }
            ];

            resolve(tabDat);
        });
    }    

    _getOptions(group) {
        if(group && group.ListOptions) {
            var items = group.ListOptions;
            return items;

            //return _.filter(items, function(item){
            //    return item.IsActive;
            //})
        }

        return [];
    }

    getWellNames(){
        return this.resource(1).then( (group) => {
            return this._getOptions(group);
        });
    }
    getMeshSizes(){
        return this.resource(2).then( (group) => {
            return this._getOptions(group);
        });
    }
    getSandSuppliers() {
        return this.resource(3).then( (group) => {
            return this._getOptions(group);
        });
    }
    getAssetTeams(){
        return this.resource(4).then( (group) => {
            return this._getOptions(group);
        });
    }

    getFreightVendors(){
        return this.resource(5).then( (group) => {
            return this._getOptions(group);
        });
    }

    getFleetDepartmentCodes(){
        return this.resource(6).then( (group) => {
            return this._getOptions(group);
        });
    }

    getStorageFacilities(){
        return this.resource(7).then( (group) => {
            return this._getOptions(group);
        });
    }

    //getVendors(){
    //    return this.resource(8).then( (group) => {
    //        return this._getOptions(group);
    //    });
    //}
}

export default AdminService;
