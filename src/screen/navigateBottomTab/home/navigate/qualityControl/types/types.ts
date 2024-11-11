import { IError } from "../../../../../share/commonVadilate/validate"

export interface IInfoIOT {
    workCenterId: string | '',
    mainCodeProduct: string | '',
    workOrderCode: string | '',
    checkListCode: string | '',
    testTypeId: string | '',
    checkPointList: string | '',
}

export interface ICreateIOT {
    workcenterid: string | '',
    maincodeproduct: string | '',
    workordercode: string | '',
    checklistcode: string | '',
    ordercode: string | '',
    testtypeid: string | '',
    timeslotcode: string | '',
    typeQAQC: number | 0,
}

export interface ICheckPercentAfterKCS {
    workcenterid: string | '',
    maincodeproduct: string | '',
    workordercode: string | '',
    checklistcode: string | '',
    testtypeid: string | '',
    timeslotcode: string | '',
    checkpointlist: [IListCheckPoint]
}

export interface IListCheckPoint {
    checkpointCode: string | '',
    checkpointName: string | '',
    isNonCheck: boolean | false,
    isCheckInRange: boolean | false,
    isCheckEqual: boolean | false,
    qtyLower: number | 0,
    qtyUpper: number | 0,
    value: string | '',
    partName: string | '',
    partId: string | '',
    detailedDescription: string | '',
    listError: IError[] | [],
    dataChecked: boolean | false
}

export interface IRecordIOT {
    workcenterid: string | '',
    maincodeproduct: string | '',
    workordercode: string | '',
    checklistcode: string | '',
    ordercode: string | '',
    testtypeid: string | '',
    timeslotcode: string | '',
    typeQAQC: number | 0,
    qtyInLot: string | '',
    qtyNeedQAQC: string | '',
    qtyOK: string | '',
    qtyAlreadyCheck: string | '',
    qtyNG: string | '',
    listItemErrors: [IListItemErrors],
    listBatchRecyclings: [IListBatchRecyclings]
}

export interface IListItemErrors {
    id: string | '',
    listCheckpointItem: [IListCheckpointItem]
}

export interface IListCheckpointItem {
    checkpointcode: string | '',
    numberofreminder: number | 0,
    iscommit: boolean | false,
    commitperson: string | '',
}

export interface IListBatchRecyclings {
    idNote: string | '',
    contentRecycling: string | '',
    listError: IError[] | [],
}

export interface IDropdown {
    id: string | '',
    name: string | '',
    code: string | '',
    isNonCheck: boolean | false,
    isCheckInRange: boolean | false,
    isCheckEqual: boolean | false,
    qtyLower: number | 0,
    qtyUpper: number | 0,
    value: string | '',
    partName: string | '',
    detailedDescription: string | '',
}

export interface ICheckRecycleOrBypo {
    Checkbypo: boolean | false,
    Isfunctionrecycling: boolean | false,
}

export interface IRequestListLot {
    date: string | '',
    workcenterid: string | ''
}

export interface IDataLot {
    Date: string | '',
    Lotcode: string | '',
    QtyCommit: number | 0,
    QtyInLot: number | 0,
    QtyTC: number | 0,
    QtyOK: number | 0,
    QtyError: number | 0,
    TestTypeName: string | '',
    Workordercode: string | '',
    EnterEachResult: boolean | false,
    Note: string | '',
    CanEdit: boolean | false,
}

export interface IDetailDataInLot {
    ListBatchRecyclingDetail: [IListBatchRecyclingDetail],
    ListCheckpointDetail: [IListCheckpointDetail]
}

export interface IListBatchRecyclingDetail {
    BatchId: string | '',
    Content: string | '',
    IsDelete: boolean | false
}

export interface IListCheckpointDetail {
    Id: string | "",
    LotCode: string | "",
    CheckpointCode: string | "",
    CheckpointName: string | "",
    IsNonCheck: boolean | false,
    IsCheckInRange: boolean | false,
    IsCheckEqual: boolean | false,
    ItemId: string | "",
    QtyLower: number | null,
    QtyUpper: number | null,
    Value: string | "",
    numberRemind: number | null,
    PartName: string | "",
    PartId: string | "",
    DetailedDescription: string | "",
    IsCommit: boolean | false,
    IsDelete: boolean | false
}

export enum typeQAQC {
    QA = 1,
    QC = 2
}