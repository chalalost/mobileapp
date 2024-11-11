import {
    ADD_ITEM, EXIT,
    DATA_PAGE_RECOR_INPUT,
    SET_DATA_USER_INFO,
    SET_DEFAULT_SCAN,
    DATA_DROPDOWN_WORKORDERCODE,
    DATA_DROPDOWN_COLOR,
    DATA_DROPDOWN_SUBCODE,
    DATA_DROPDOWN_SEASON,
    DATA_DROPDOWN_MARKET,
    DATA_DROPDOWN_SIZE
} from "./actionTypes";
import { IDataPageRecordInput, IUserScan } from './../types/productionRecordTypes';

export interface IWorkOrderCodeV2 {
    id: string | '',
    name: string | '',
    productCodeArr: string | '',
}

export type UserKeepRecordAction = {
    type: typeof ADD_ITEM;
    // dataOrderWork: IWorkOrderCodeV2;
    // dataPageRecordInput: IDataPageRecordInput;
    // listInfoProductMobile: IListInforProductMobile;
};

export interface IDropdown {
    id: string | '',
    name: string | '',
    code: string | '',
}

export interface IListInforProductMobile {
    Subcodeproduct: string | '',
    Productcode: string | '',
    Sizecode: string | '',
    Sizename: string | '',
    Marketcode: string | '',
    Marketname: string | '',
    Colorcode: string | '',
    Colorname: string | '',
    Seasoncode: string | '',
    Seasonname: string | '',
    DateRecord: string | '',
    TimeSlot: string | ''
}

export interface ITimeSlot {
    id: string | '',
    name: string | '',
    code: string | '',
    line: string | ''
}

export interface IDropdownWorkCenter {
    id: string | '',
    name: string | '',
    code: string | null
}


export type UserStopRecordAction = {
    type: typeof EXIT;
};


export type DataPageRecor = {
    type: typeof DATA_PAGE_RECOR_INPUT;
    payload: IDataPageRecordInput;
};

export type DataDropdownWorkOrderCode = {
    type: typeof DATA_DROPDOWN_WORKORDERCODE;
    payload: IWorkOrderCodeV2;
}
export type DataDropdownColor = {
    type: typeof DATA_DROPDOWN_COLOR;
    payload: IWorkOrderCodeV2;
}
export type DataDropdownSubCode = {
    type: typeof DATA_DROPDOWN_SUBCODE;
    payload: IWorkOrderCodeV2;
}
export type DataDropdownSeason = {
    type: typeof DATA_DROPDOWN_SEASON;
    payload: IWorkOrderCodeV2;
}
export type DataDropdownMarket = {
    type: typeof DATA_DROPDOWN_MARKET;
    payload: IWorkOrderCodeV2;
}
export type DataDropdownSize = {
    type: typeof DATA_DROPDOWN_SIZE;
    payload: IWorkOrderCodeV2;
}

export type SetDataUserInfo = {
    type: typeof SET_DATA_USER_INFO;
    payload: IUserScan;
};

export type SetDEFAULTSCAN = {
    type: typeof SET_DEFAULT_SCAN;
    payload: IUserScan;
};



export type ProductionRecordActions =
    | UserKeepRecordAction
    | UserStopRecordAction
    | DataPageRecor
    | DataDropdownWorkOrderCode
    | DataDropdownColor
    | DataDropdownSubCode
    | DataDropdownSeason
    | DataDropdownMarket
    | DataDropdownSize
    | SetDataUserInfo | SetDEFAULTSCAN;