export default {
        "COLLECTION": [

            /*
             Test Without Freight Vendors
             */
            //{
            //    ID: 271151,
            //    Diversion: false,
            //    ModifiedBy: 'powel398',
            //    Attachment: false,
            //    IsDuplicate: false,
            //    SandSupplier: {
            //        Name: "226926", // Read-only
            //        PONumber: 89463, // Read-only
            //        BOLNumber: "19737194", // Read-only
            //        POReceiptNumber: 271151, // Read-only
            //        MeshSizeID: 17,
            //        MeshSize: " Sand, Premium (White), 20-40 Mesh", // Read-only
            //        ServiceDate: "2015-09-25", // Read-only
            //        ReceiveDate: "2015-12-15" // Read-only
            //    },
            //    FreightVendors: [   {
            //        "ID": 2763,
            //        "InvoiceNumber": "2763"
            //    }]
            //},
            /*
             Test with one freight vendor
             */
            {
                ID: 271773,
                Diversion: true,
                ModifiedBy: 'powel1239',
                Attachment: true,
                IsDuplicate: true,
                SandSupplier: {
                    Name: "231725",
                    POReceiptNumber: 271773,
                    PONumber: 93388,
                    BOLNumber: "53458",
                ServiceDate: "2015-09-29",
                ReceiveDate: "2015-09-28",
                ShipDate: "2015-11-05",
                WeightInPounds: 200,
                AssetTeamID: 1,
                FleetDepartmentCodeID: 1,
                WellNameID: 1,
                StorageFacilityID: 1,
                StorageFacilityTicketNumber: "ST3984",
                Notes: "Changed",
                InvoiceAmount: 30.34,
                InvoiceNumber: "0394569545",
                InvoiceDate: "2015-03-20",
                InvoiceCodedDate: "2015-04-19",
                PricePerPound: 100.20,
                EnergySurcharge: 20.01
            },
            FreightVendors: [
                {
                    ID: 2518,
                    FreightVendorID: 4,
                    BOLNumber: "BOL2222",
                    WeightInPounds: 23,
                    Miles: 23,
                    WellNameID: 1,
                    FleetDepartmentCodeID: 1,
                    AssetTeamID: 1,
                    Notes: "Sent",
                    InvoiceAmount: 203.44,
                    InvoiceNumber: "N2000",
                    InvoiceDate: "2015-02-07",
                    InvoiceCodedDate: "2015-02-07",
                    FreightDollarAmount: 2040.94,
                    FuelSurchargeAmount: 20358.93,
                    DetentionHours: 1.50,
                    DetentionRate: 1.30,
                    OtherMiscCharges: 302.92
                },
                {
                    ID: 21726
                }


            ]
        },

        //{
        //    ID: 271162,
        //    Diversion: true,
        //    ModifiedBy: 'powel1239',
        //    Attachment: true,
        //    IsDuplicate: false,
        //    SandSupplier: {
        //        Name: "201026",
        //        POReceiptNumber: 271162,
        //        PONumber: 91313,
        //        BOLNumber: "39003400",
        //        MeshSizeGroupID: 2,
        //        MeshSizeID: 25,
        //        MeshSize: " Sand, Standard (Brown), 30-50 Mesh",
        //        ServiceDate: "2015-09-25",
        //        ReceiveDate: "2015-09-21",
        //
        //        ShipDate: "2015-11-04",
        //        WeightInPounds: 201,
        //        AssetTeamID: 2,
        //        FleetDepartmentCodeID: 2,
        //        WellNameID: 2,
        //        StorageFacilityID: 2,
        //
        //        StorageFacilityTicketNumber: "ST398422",
        //        Notes: "Changed Now",
        //        InvoiceAmount: 32.34,
        //        InvoiceNumber: "044444",
        //        InvoiceDate: "2015-03-25",
        //        InvoiceCodedDate: "2015-04-22",
        //        PricePerPound: 250.20,
        //        EnergySurcharge: 2030.01
        //    },
        //    FreightVendors: [
        //        {
        //            ID: 2767,
        //            FreightVendorID: 1,
        //            BOLNumber: "BOL22233322",
        //            WeightInPounds: 33,
        //            Miles: 24,
        //            WellNameID: 2,
        //            FleetDepartmentCodeID: 2,
        //            AssetTeamID: 2,
        //            Notes: "Sent ototo",
        //            InvoiceAmount: 222.44,
        //            InvoiceNumber: "N2444000",
        //            InvoiceDate: "2015-02-17",
        //            InvoiceCodedDate: "2015-02-17",
        //            FreightDollarAmount: 2041.94,
        //            FuelSurchargeAmount: 208.93,
        //            DetentionHours: 2.50,
        //            DetentionRate: 3.30,
        //            OtherMiscCharges: 312.92
        //        },
        //        {
        //            FreightVendorID: 2,
        //            BOLNumber: "B3322",
        //            WeightInPounds: 2,
        //            Miles: 2,
        //            WellNameID: 1,
        //            FleetDepartmentCodeID: 1,
        //            AssetTeamID: 1,
        //            Notes: "Seeeeeet ototo",
        //            InvoiceAmount: 24.44,
        //            InvoiceNumber: "Neee2444000",
        //            InvoiceDate: "2015-01-17",
        //            InvoiceCodedDate: "2015-01-17",
        //            FreightDollarAmount: 21.94,
        //            FuelSurchargeAmount: 2.93,
        //            DetentionHours: 22.50,
        //            DetentionRate: 32.30,
        //            OtherMiscCharges: 332.92
        //        }
        //
        //    ]
        //}

    ]

}