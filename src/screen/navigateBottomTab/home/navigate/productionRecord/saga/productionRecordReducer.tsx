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
} from '../types/actionTypes'
import { IWorkOrderCodeV2, ProductionRecordActions } from '../types/types'
import { IDataPageRecordInput, IUserDropdown, IUserScan } from './../types/productionRecordTypes';


interface IDataQrFocus {
    Id: string | '',
    Name: string | '',
}
interface IDataRecordOfWorkerOld {
    Id: string | '',
    Name: string | '',
    QtyCutPartNew: Number | 0,
    Qtydone: Number | 0,
}

interface IInitState {
    isContinue: boolean | false,
    dataPageRecordSX: IDataPageRecordInput,
    dataQrFocus: IDataQrFocus,
    dataRecordOfWorkerOld: IDataRecordOfWorkerOld,
    lstDropdownOrderCode: IWorkOrderCodeV2,
    lstDropdownColor: IWorkOrderCodeV2,
    lstDropdownSubCode: IWorkOrderCodeV2,
    lstDropdownSeason: IWorkOrderCodeV2,
    lstDropdownMarket: IWorkOrderCodeV2,
    lstDropdownSize: IWorkOrderCodeV2,
    userScan: IUserScan,
    isScan: boolean | false,
    userDropdown: IUserDropdown

}


const initState: IInitState = {
    isContinue: false,
    dataPageRecordSX: {
        Workcenterid: '',
        Workcentername: '',
        Workordercode: '',
        ItemCode: '',
        Color: '',
        subCode: '',
        Maincodeproduct: '',
        Seasoncode: '',
        Marketcode: '',
        Sizecode: '',
        DateRecord: '',
        TimeSlot: ''
    },
    dataQrFocus: {
        Id: '',
        Name: ''
    },
    dataRecordOfWorkerOld: {
        Id: '',
        Name: '',
        QtyCutPartNew: 0,
        Qtydone: 0,
    },
    lstDropdownOrderCode: {
        id: '',
        name: '',
        productCodeArr: '',
    },
    lstDropdownColor: {
        id: '',
        name: '',
        productCodeArr: '',
    },
    lstDropdownSubCode: {
        id: '',
        name: '',
        productCodeArr: '',
    },
    lstDropdownSeason: {
        id: '',
        name: '',
        productCodeArr: '',
    },
    lstDropdownMarket: {
        id: '',
        name: '',
        productCodeArr: '',
    },
    lstDropdownSize: {
        id: '',
        name: '',
        productCodeArr: '',
    },
    userScan: {
        id: '',
        name: '',
        code: ''
    },
    isScan: false,
    userDropdown: {
        userId: '',
        userName: ''
    }

}

const productionRecordReducer = (state = initState, action: ProductionRecordActions) => {
    switch (action.type) {
        case ADD_ITEM:
            state.isContinue = true;
            return {
                ...state,
            };
        case EXIT:
            state.isContinue = false;
            return {
                ...state,
            };
        case DATA_PAGE_RECOR_INPUT:
            state.dataPageRecordSX = action.payload;
            return {
                ...state,
            };
        case DATA_DROPDOWN_WORKORDERCODE:
            state.lstDropdownOrderCode = action.payload;
            return {
                ...state,
            };
        case DATA_DROPDOWN_COLOR:
            state.lstDropdownColor = action.payload;
            return {
                ...state,
            };
        case DATA_DROPDOWN_SUBCODE:
            state.lstDropdownSubCode = action.payload;
            return {
                ...state,
            };
        case DATA_DROPDOWN_SEASON:
            state.lstDropdownSeason = action.payload;
            return {
                ...state,
            };
        case DATA_DROPDOWN_MARKET:
            state.lstDropdownMarket = action.payload;
            return {
                ...state,
            };
        case DATA_DROPDOWN_SIZE:
            state.lstDropdownSize = action.payload;
            return {
                ...state,
            };
        case SET_DATA_USER_INFO:
            state.userScan = action.payload;
            state.isScan = true;
            return {
                ...state,
            };

        case SET_DEFAULT_SCAN:
            // state.userScan = action.payload;
            state.isScan = false;
            return {
                ...state,
            };

        default: {
            return {
                ...state
            }
        }
    }
}

export default productionRecordReducer;
