export interface IDataPageRecordInput {
    Workcenterid: string | '',
    Workordercode: string | '',
    ItemCode: string | '',
    Color: string | '',
    subCode: string | '',
    Maincodeproduct: string | '',
    Seasoncode: string | '',
    Marketcode: string | '',
    Sizecode: string | '',
    DateRecord: string | '',
    TimeSlot: string | '',
}


export interface IUserScan {
    id: string | '',
    name: string | '',
    code: string | '',
}

export interface IUserDropdown {
    userId: string | '',
    userName: string | ''
}


export interface IUserDefaultCallApi {
    QtyCutPartOld: string | '',
    QtyCutPartNew: string | '',
    Qtydone: string | '',
    QtyInputInline: string | '',
    QtyNeed: string | '',
    QtyLK: string | '',
    Stepid: string | '',
    Stepname: string | '',
    Workerid: string | '',
    Workername: string | '',
}

export interface IWorkOrderCodeV2 {
    id: string | '',
    name: string | '',
    productCodeArr: string | '',
}

export interface IRecorDataByUser {
    Productcode: string | '',
    Workcenterid: string | '',
    Workordercode: string | '',
    Workerid: string | '',
    Stepid: string | '',
    QtyCutPartNew: string | '',
    Qtydone: string | '',
    QtyInputInline: string | '',
    Slottimecode: string | '',
    RecordForDate: string | '',
}

