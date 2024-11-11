import { HOME_GET_DATA_REDUCER, HOME_GET_DATA_SAGA, HOME_GET_DATETIME } from './actionTypes';


export interface HomeState {
    getDataHomeSelector: string | ''
    getErrorSelector: string | ''
    getDateTimeSelector: string | ''
    getStatusSelector: boolean | false
}

export interface ITodo {
    userId: number;
    id: number;
    title: string;
    completed: boolean;
}

export interface IDropdown {
    id: string | '',
    name: string | '',
    code: string | '',
}

export interface GetDataHomeSagaModel {
    todos: ITodo;
}
export type GetDataHomeSaga = {
    type: typeof HOME_GET_DATA_SAGA;
    payload: GetDataHomeSagaModel;
};

export interface IDataReportProgress {
    QtyAfterWash: number | 0,
    QtyFinishedWarehouse: number | 0,
    QtyInline: number | 0,
    QtyKH: number | 0,
    QtyLaundry: number | 0,
    QtyOuputGarment: number | 0,
    QtyLKOuputGarment: number | 0,
    QtyOutputBond: number | 0,
    Workcenterid: string | '',
    Workcentername: string | '',
    Maincodeproduct: string | '',
    Color: string | '',
    PercentColor: string | '',
    Percent: string | ''
}

export interface IPopupReport {
    Workcenterid: string | '',
    Workcentername: string | '',
    Maincodeproduct: string | '',
    QtyAfterWash: number | 0,
    QtyFinishedWarehouse: number | 0,
    QtyInline: number | 0,
    QtyKH: number | 0,
    QtyLaundry: number | 0,
    QtyLKOuputGarment: number | 0,
    QtyOuputGarment: number | 0,
    QtyOutputBond: number | 0,
    Color: string | '',
    PercentColor: string | '',
    Percent: string | ''
}

export interface IDropdownData {
    id: string | '',
    name: string | '',
    code: string | '',
}

export interface IReportQuantityByDay {
    Timeslotcode: string | '',
    Timeslotname: string | '',
    FromTime: string | '',
    ToTime: string | '',
    Qtynow: number | 0,
    Qtyold: number | 0,
    Qtydifference: number | 0,
    QtyOuputBond: number | 0,
}

export interface ISaleReport {
    Workareaid: string | '',
    ListWorkcenter: [IListWorkCenter]
}

export interface IListWorkCenter {
    Manager: string | '',
    Workareaid: string | '',
    Workcenterid: string | '',
    Workcentername: string | '',
    Customercode: string | '',
    Customername: string | '',
    Seasoncode: string | '',
    Seasonname: string | '',
    Productcode: string | '',
    Maincodeproduct: string | '',
    Modelcode: string | '',
    Modelname: string | '',
    TotalQtyKH: number | 0,
    TotalQtyReal: number | 0,
    TotalQtyYet: number | 0,
    DateSXFirst: string | '',
    NumberDateSX: number | 0,
    DateEndEs: string | '',
    QtyLabor: number | 0,
    QtyLaborOld: number | 0,
    QtyOutputCurrent: number | 0,
    QtyOutputOld: number | 0,
    CustomerWage: number | 0,
    CustomerRevenue: number | 0,
    CustomerRevenuePerWorker: number | 0,
    CustomerRevenuePerWorkerOld: number | 0,
    CustomerRevenueDifferent: number | 0,
    InternalWage: number | 0,
    InternalRevenue: number | 0,
    InternalRevenuePerWorker: number | 0,
    InternalRevenuePerWorkerOld: number | 0,
    InternalRevenueDifferent: number | 0,
    ItemPerWorker: number | 0,
    ItemPerWorkerOld: number | 0,
    ItemPerWorkerDifferent: number | 0,
}

export interface ILaborReport {
    QtyAllLabor: number | 0,
    QtyAllAbsence: number | 0,
    QtyAllReal: number | 0,
    QtyAllProductivity: number | 0,
    QtyAllStudent: number | 0,
    QtyAllTV: number | 0,
    QtyAllEatinglabor: number | 0,
    ListWorkcenter: [IDataListWorkCenter]
}

export interface IProductionInfo {
    Workordercode: string | '',
    TotalInline: number | 0,
    TotalOutput: number | 0,
    TotalLaundry: number | 0,
    TotalAfterWash: number | 0,
    TotalFinishWarehouse: number | 0
}

export interface ILaborInfo {
    QtyAllLabor: number | 0,
    QtyAllAbsence: number | 0,
    QtyAllReal: number | 0,
    QtyAllProductivity: number | 0,
    QtyAllStudent: number | 0,
    QtyAllTV: number | 0,
    QtyAllEatinglabor: number | 0,
    ListWorkcenter: [IDataListWorkCenter]
}

export interface IDataListWorkCenter {
    Workcenterid: string | '',
    Workcentername: string | '',
    QtyLaborReal: number | 0,
    QtyLaborDayOff: number | 0,
}

export interface IChartLabel {
    x: number | 0,
    y: number | 0,
}
export interface IChartPie {
    x: number | 0,
    y: number | 0,
    label: string | ''
}

export interface IRequestData {
    workCenter: string | '',
    date: string | ''
}

export interface IWorkCenter {
    Workcenterid: string | '',
    Workcentername: string | ''
}


export interface GetDataHomeReducerModel {
    error: string;
}
export type GetDataHomeReducer = {
    type: typeof HOME_GET_DATA_REDUCER;
    payload: GetDataHomeReducerModel;
};

export type GetDateTimeReducer = {
    type: typeof HOME_GET_DATETIME;
    payload: string
}



export type HomeActions =
    | GetDataHomeSaga
    | GetDataHomeReducer
    | GetDateTimeReducer
    ;