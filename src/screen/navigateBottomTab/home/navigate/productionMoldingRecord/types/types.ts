import { IError } from "../../../../../share/commonVadilate/validate"

export interface IProductionMolding {
    workcenterid: string | "",
    materialcode: string | "",
    workordercode: string | "",
    daterecord: string | "",
    timeslotcode: string | "",
    qtyDone: number | 0,
    qtyExample: number | 0,
    qtyError: number | 0,
    qtyDay: number | 0,
    qtyDayError: number | 0,
    qtyDayDone: number | 0,
    lostTime: 0,
    listError: [IListErr],
    listLostTime: [IListLostTime]
}

export interface IListErr {
    errorId: string | "",
    qtyError: number | 0
}

export interface IListLostTime {
    lostId: string | "",
    qtyLostTime: string | "",
    listError: IError[] | [],
}

export interface IDropdownForModal {
    name: string | "",
    id: string | "",
    code: string | "",
    line: string | "",
    qtydetailwo: string | "",
    qty: string | "",
    listError: IError[] | [],
}