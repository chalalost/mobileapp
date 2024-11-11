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
    QtyStorage: string | ''
}

export interface IUserDefaultCallApi {
    QtyDay: string | '',
    QtyKH: string | '',
    QtyLKStorage: string | '',
    QtyStorage: string | '',
    QtyTatolSX: string | '',
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

