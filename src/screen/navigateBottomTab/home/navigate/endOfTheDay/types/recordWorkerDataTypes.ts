import { IError } from "../../../../../share/commonVadilate/validate";

export interface IWorkCenterLabor {
    Workcenterid: string | '',
    Date: string | '',
    Totallabor: number | null,
    Seasonallabor: number | null,
    Studentlabor: number | null,
    Eatinglabor: number | null,
    Productivitylabor: number | null,
}

export interface ISupportWorker {
    Id: string | '',
    Workerid: string | '',
    Workercode: string | '',
    Workername: string | '',
    listError: IError[] | []
}
export interface IWorkerSupportOther {
    Workerid: string | '',
    Workercode: string | '',
    Workername: string | '',
    WorkcenterTo: string | '',
    listError: IError[] | []
}