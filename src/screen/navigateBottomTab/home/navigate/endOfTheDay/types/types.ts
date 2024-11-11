import { DATA_PAGE_INPUT } from "./actionsTypes";
import { IWorkCenterLabor } from "./recordWorkerDataTypes";


export type DataPageReport = {
    type: typeof DATA_PAGE_INPUT;
    payload: IWorkCenterLabor;
};

export type RecordDateWorkerEndAction =
    | DataPageReport;