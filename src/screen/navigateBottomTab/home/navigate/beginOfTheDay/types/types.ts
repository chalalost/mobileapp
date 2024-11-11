import { DATA_PAGE_INPUT } from "./actionTypes";
import { IWorkCenterLabor } from "./reportWorkerTypes";

export type DataPageReport = {
    type: typeof DATA_PAGE_INPUT;
    payload: IWorkCenterLabor;
};

export type ReportWorkerAction =
    | DataPageReport;