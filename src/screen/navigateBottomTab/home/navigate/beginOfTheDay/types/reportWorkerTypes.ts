import { IError } from '../../../../../share/commonVadilate/validate';
export interface IWorkCenterLabor {
    Workcenterid: string | '',
    Date: string | '',
    Totallabor: number | null,
    Seasonallabor: number | null,
    Studentlabor: number | null,
    Eatinglabor: number | null,
    Productivitylabor: number | null,
}

export interface IAbsenseWorker {
    Workerid: string | '',
    ReasonCode: string | '',
    NumberWorkOff: number | null
}

export interface IWorker {
    Id: string | ''
    Workerid: string | '',
    ReasonCode: string | '',
    NumberWorkOff: string | '',
    OrtherReason: string | '',
    listError: IError[] | []
}
