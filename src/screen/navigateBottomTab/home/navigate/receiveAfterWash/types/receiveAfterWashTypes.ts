export interface IDataPageReceiveForWash {
    dateRecord: string | '',
    workCenterId: string | '',
    mainProductCode: string | '',
    colorCode: string | '',
    subProductCode: string | '',
    workOrderCode: string | '',
    marketcode: string | '',
    seasonCode: string | '',
    sizeCode: string | '',
    qtyNow: string | '',
    qtyErrorNow: string | ''
}

export interface IDataQty {
    QtyKH: number | 0,
    QtyLaundry: number | 0,
    QtyLKReceive: number | 0,
    QtyTotalError: number | 0
    PercentError: number | 0
}

export interface IDropdown {
    id: string | '',
    name: string | '',
    code: string | '',
}

export enum ListFilterReceiveForWash {
    Workcenterid = 1,
    Maincodeproduct = 2,
    Colorcode = 3,
    Subcodeproduct = 4,
    Marketcode = 5,
    Seasoncode = 6,
    Workordercode = 7,
    SizeCode = 8
}