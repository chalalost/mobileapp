import {
    DATA_PAGE_RECOR_INPUT,
    SET_DATA_USER_INFO,
    SET_DEFAULT_SCAN,
    DATA_DROPDOWN_WORKORDERCODE,
    DATA_DROPDOWN_COLOR,
    DATA_DROPDOWN_SUBCODE,
    DATA_DROPDOWN_SEASON,
    DATA_DROPDOWN_MARKET,
    DATA_DROPDOWN_SIZE
} from '../types/actionTypes';
import { IDataPageRecordInput, IWorkOrderCodeV2, IUserScan } from './../types/productionRecordTypes';


const productionRecordAction = {
    setDataPageRecorReducer: (dataPageRecordInput: IDataPageRecordInput) => {
        return {
            type: DATA_PAGE_RECOR_INPUT,
            payload: dataPageRecordInput,
        };
    },
    setDataDropDownWorkOrderCode: (dataDropDown: IWorkOrderCodeV2) => {
        return {
            type: DATA_DROPDOWN_WORKORDERCODE,
            payload: dataDropDown,
        };
    },
    setDataDropDownColor: (dataDropDown: IWorkOrderCodeV2) => {
        return {
            type: DATA_DROPDOWN_COLOR,
            payload: dataDropDown,
        };
    },
    setDataDropDownSubCode: (dataDropDown: IWorkOrderCodeV2) => {
        return {
            type: DATA_DROPDOWN_SUBCODE,
            payload: dataDropDown,
        };
    },
    setDataDropDownSeason: (dataDropDown: IWorkOrderCodeV2) => {
        return {
            type: DATA_DROPDOWN_SEASON,
            payload: dataDropDown,
        };
    },
    setDataDropDownMarket: (dataDropDown: IWorkOrderCodeV2) => {
        return {
            type: DATA_DROPDOWN_MARKET,
            payload: dataDropDown,
        };
    },
    setDataDropDownSize: (dataDropDown: IWorkOrderCodeV2) => {
        return {
            type: DATA_DROPDOWN_SIZE,
            payload: dataDropDown,
        };
    },
    setUserScan: (user: IUserScan): any => {
        return {
            type: SET_DATA_USER_INFO,
            payload: user
        };
    },
    setDefaultScan: (user: IUserScan): any => {
        return {
            type: SET_DEFAULT_SCAN,
            payload: user
        };
    },

};

export default productionRecordAction;
