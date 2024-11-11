export interface IDataPageDeliverySemiFinishProduct {
    dateRecord: string | '',
    workCenterId: string | '',
    mainProductCode: string | '',
    colorCode: string | '',
    workOrderCode: string | '',
    sizeCode: string | '',
    qtyNow: string | '',
}

export interface IDataQty {
    QtyKH: number | 0,
    EsQtyLK: number | 0,
    QtyLK: number | 0,
    QtyLKCut: number | 0
}

export interface IDropdown {
    id: string | '',
    name: string | '',
    code: string | '',
}

export enum ListFilterDeliveryBTP {
    Workcenterid = 1,
    Workordercode = 2,
    Maincodeproduct = 3,
    Colorcode = 4,
    Sizecode = 5,
}