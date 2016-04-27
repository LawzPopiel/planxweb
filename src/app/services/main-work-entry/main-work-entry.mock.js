'use strict';

import fixture from './main-work-entry.fixtures';
import MockHttp from '../mock-http';
import _ from 'lodash';
import {Run} from '../../ng-decorators'; // jshint unused: false

import {ID_PROP} from 'app/globals';

class MainWorkEntryServiceMock extends MockHttp {
    //start-non-standard
    @Run()
    //end-non-standard
    runFactory($httpBackend, MainWorkEntryService){
        var route = MainWorkEntryService.getRoute();
        var overrides = {
            "LIST": (method, url, data, headers) => {
                var returnCollection = [];
                _.each(fixture.COLLECTION, function(item) {

                    if(item.FreightVendors) {
                        _.each(item.FreightVendors, function(vendor) {
                            var ri = {
                                [ID_PROP]: item[ID_PROP],
                                SandSupplierID: item.SandSupplier.SandSupplierID,
                                SandSupplierName: item.SandSupplier.Name,
                                SandSupplierPONumber: item.SandSupplier.PONumber,
                                SandSupplierBOLNumber: item.SandSupplier.BOLNumber,
                                SandSupplierPOReceiptNumber: item.SandSupplier.POReceiptNumber,
                                SandSupplierServiceDate: item.SandSupplier.ServiceDate,
                                SandSupplierReceiveDate: item.SandSupplier.ReceiveDate,
                                FreightVendorID: vendor.FreightVendorID,
                                FreightVendorBOLNumber: vendor.BOLNumber,
                                FreightVendorInvoiceNumber: vendor.InvoiceNumber,
                                FreightVendorAreaAssignment: vendor.AreaAssignment,
                                FreightVendorQuantityReceived: vendor.FreightVendorQuantityReceived,
                                Attachment: item.Attachment,
                                Diversion: item.Diversion,
                                CreatedOn: item.CreatedOn


                            };

                            returnCollection.push(ri);

                        });

                    } else {
                        var ri = {
                            [ID_PROP]: item[ID_PROP],
                            SandSupplierID: item.SandSupplier.SandSupplierID,
                            SandSupplierName: item.SandSupplier.Name,
                            SandSupplierPONumber: item.SandSupplier.PONumber,
                            SandSupplierBOLNumber: item.SandSupplier.BOLNumber,
                            SandSupplierPOReceiptNumber: item.SandSupplier.POReceiptNumber,
                            SandSupplierServiceDate: item.SandSupplier.ServiceDate,
                            SandSupplierReceiveDate: item.SandSupplier.ReceiveDate,
                            Attachment: item.Attachment,
                            Diversion: item.Diversion,
                            CreatedOn: item.CreatedOn
                        };
                        returnCollection.push(ri);
                    }
                });
                returnCollection = super.filter(url, returnCollection);
                return [200, returnCollection];

            }
        };


        super.init($httpBackend, route, fixture, overrides);
    }
}


export default MainWorkEntryServiceMock;
