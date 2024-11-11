export interface IDataPageDeliveryForWash {
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
}

export interface IDataQty {
    QtyKH: number | 0,
    QtySX: number | 0,
    QtyLK: number | 0
}

export interface IDropdown {
    id: string | '',
    name: string | '',
    code: string | '',
}

export enum ListFilterDeliveryForWash {
    Workcenterid = 1,
    Maincodeproduct = 2,
    Colorcode = 3,
    Subcodeproduct = 4,
    Marketcode = 5,
    Seasoncode = 6,
    Workordercode = 7,
    SizeCode = 8
}