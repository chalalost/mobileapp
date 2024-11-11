export interface IDataPageDeliveryHTWareHouse {
    dateRecord: string | '',
    workCenterId: string | '',
    mainProductCode: string | '',
    colorCode: string | '',
    subProductCode: string | '',
    workOrderCode: string | '',
    marketcode: string | '',
    seasonCode: string | '',
    sizeCode: string | '',
    qtyStorage: string | '',
}

export interface IDataQty {
    QtyKH: number | 0,
    QtyLKStorage: number | 0,
    QtyTatolSX: number | 0,
}

export interface IDropdown {
    id: string | '',
    name: string | '',
    code: string | '',
    qtydetailwo: string | ''
}

export enum ListFilterDeliveryHTWareHouse {
    Workcenterid = 1,
    Workordercode = 2,
    Maincodeproduct = 3,
    Subcodeproduct = 4,
    Colorcode = 5,
    Seasoncode = 6,
    Marketcode = 7,
    SizeCode = 8
}