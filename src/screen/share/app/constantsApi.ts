
export interface ResponseService {
    data: any | null
    isSuccess: boolean | false
    message: string | ''
    status: number | 0
}

export interface RequestService {
    data: any | null
    isSuccess: boolean | false
    message: string | ''
    status: number | 0
}

export interface ResponseDataAuthen {
    Data: any | null
    DataNew: any | null
    MesageStatus: String | ''
    Message: string | ''
    Status: number | 0
    StatusCode: number | 0
    Success: boolean | false
}

export const DropDownType = {
    WorkArea: 1,
    WorkCenter: 2,
    WorkUnit: 3,
    Worker: 4,
    Type: 5,
    Function: 6,
    GroupWorkDay: 7,
    WorkAreaOnlyChild: 8,
    Skill: 9,
    Provinces: 10,
    District: 11,
    Position: 12,
    Department: 13,
    Product: 14,
    Calendar: 15,
    BomSlot: 16,
    Sop: 17,
    ProductStatusBomCreate: 18,
    Model: 19,
    ApprvalDefaultStep: 20,
    Process: 21,
    Productionrequirement: 22,
    StepProcess: 23,
    Checkpoint: 24,
    Checklist: 25,
    Workorder: 26,
    Error: 27,
    Color: 30,
    MaketProduct: 31,
    Season: 32,
    Size: 33,
    Maincodeproduct: 34,
    WorkorderV2: 35,
    Timelot: 36,
    Subcodeproduct: 37,
    Customer: 38,
    WorkerInWorkcenter: 39,//Nguoi lao dong duoc setup tren workcenter
    Reason: 40, //ly do nghi
    WorkerSupportWorkCenter: 41, // Ds cong nhan sp chuyen may khac
    WorkCenterAll: 42, // Lay tat ca workcenter 
    WorkerWithWorkCenter: 43, // Ds cong nhan di kem voi to lao dong 
    TypeCheck: 45,
};

export enum TypeWorkcenterMobile {
    May = 1,//May
    Cat = 2,//Cat
    HoanThien = 3,//Hoan Thien
    Kho = 4,//Kho
    VanPhong = 5,//Van Phong
}

// khai bao api cho tung screen
const ApiCommon = {
    GET_API_COMMON: '/api/production-management-service/common-mobile/get-dropdown-by-type',
    GET_API_COMMON_2: '/api/production-management-service/common-mobile/get-dropdown-by-type-ver2',
    GET_WORKCENTER_INFO_BY_USER: '/api/production-management-service/common-mobile/get-infor-workcenter-by-user'
}

const ApiHomeReport = {
    PRODUCTION_REPORT_PROGRESS: '/api/production-management-service/report-mobile/product-progress-report',
    REPORT_QUANTITY_BY_DAY: '/api/production-management-service/report-mobile/report-quantity-by-day',
    SALE_REPORT: '/api/production-management-service/report-mobile/sales-report',
    LABORWORK_REPORT: '/api/production-management-service/report-mobile/labor-report',
    PRODUCTION_INFO: '/api/production-management-service/report-mobile/infor-manufacturing-by-day'
}

const ApiWorkerBegin = {
    GET_INFO_WORKCENTER_BY_USERID: '/api/production-management-service/labor-line-report-mobile/get-infor-workcenter',
    GET_INFO_WORKCENTER_BY_WORKCENTER_ID: '/api/production-management-service/labor-line-report-mobile/get-infor-workcenter-labor',
    CREATE_REPORT_LINE_LABOR_IN_DAY: '/api/production-management-service/labor-line-report-mobile/report-line-labor-day',
}

const ApiSupportWorkerEnd = {
    GET_INFO_WORKCENTER_BY_USERID: '/api/production-management-service/labor-line-report-mobile/get-infor-workcenter',
    GET_DROPDOWN_DATA_WORKER_BY_TYPE: '/api/production-management-service/record-manufacturing-moblie/get-work-by-type',
    GET_INFO_WORKCENTER_BY_WORKCENTER_ID: '/api/production-management-service/labor-line-report-mobile/get-infor-workcenter-support/',
    UPLOAD_DATA_SUPPORT_WORKER: '/api/production-management-service/labor-line-report-mobile/report-line-support-day'
}

const ApiLogin = {
    AUTHEN: '/api/identity/mobi/login-mobile',
    AUTHEN_GET_TOKEN: '/api/identity/mobi/update-device-mobile-token-by-userId',
}

const ApiProductionRecord = {
    GET_WORK_BY_TYPE: '/api/production-management-service/record-manufacturing-mobile/get-work-by-type',
    GET_LOCATION_RECORD: '/api/production-management-service/record-manufacturing-mobile/get-infor-location-record',
    GET_INFO_WORKER_RECORD: '/api/production-management-service/record-manufacturing-mobile/get-infor-worker-record',
    GET_LIST_STEP_SUPPORT: '/api/production-management-service/record-manufacturing-mobile/get-list-step-to-support',
    CARRY_OUT_PRODUCTION_RECORD: '/api/production-management-service/record-manufacturing-mobile/carry-out-production-recording',
    GET_INFO_WORKORDER: '/api/production-management-service/record-manufacturing-mobile/get-infor-workorder-record',
    GET_DATA_BY_FILTER: '/api/production-management-service/record-manufacturing-mobile/get-filter-record-manufacturing',
    GET_PRODUCTCODE_BY_SKU: '/api/production-management-service/record-manufacturing-mobile/get-productcode-by-sku'
}

const ApiDeliveryBTP = {
    LIST_FILTER: '/api/production-management-service/delivery-btp-mobile/get-list-filter-for-delivery-btp',
    GET_INFO_DELIVERY_BTP: '/api/production-management-service/delivery-btp-mobile/get-infor-record-delivery-btp',
    RECORD_DELIVERY_BTP: '/api/production-management-service/delivery-btp-mobile/record-delivery-btp',
    DELETE_DELIVERY_BTP: '/api/production-management-service/delivery-btp-mobile/delete-record-delivery-btp'
}

const ApiDeliveryForWash = {
    LIST_FILTER: '/api/production-management-service/record-laundry-mobile/get-list-filter-for-record-laundry',
    GET_INFO_DELIVERY_WASH: '/api/production-management-service/record-laundry-mobile/get-infor-record-laundry',
    RECORD_DELIVERY_WASH: '/api/production-management-service/record-laundry-mobile/record-goods-laundry'
}

const ApiReceiveForWash = {
    GET_INFO_RECEIVE_WASH: '/api/production-management-service/record-receive-after-wash-mobile/get-infor-receive-after-wash',
    RECORD_RECEIVE_WASH: '/api/production-management-service/record-receive-after-wash-mobile/get-infor-record-receive-after-wash'
}

const ApiDeliveryHTWareHouse = {
    LIST_FILTER: '/api/production-management-service/record-output-finished-warehouse-mobile/get-filter-finished-warehouse',
    GET_INFO_DELIVERY_HT: '/api/production-management-service/record-output-finished-warehouse-mobile/get-infor-record-output-finished-warehouse',
    RECORD_DELIVERY_HT: '/api/production-management-service/record-output-finished-warehouse-mobile/record-output-finished-warehouse'
}

const ApiPermission = {
    GetPermission: '/api/identity/menu-manage/get-tree-menu-by-userid'
}

const ApiQC = {
    GET_INFO_CREATE_IOT: '/api/production-management-service/check-quality-mobile/infor-create-lot',
    GET_INFO_PART_ERROR: '/api/production-management-service/check-quality-mobile/infor-part-error',
    GET_NUMBER_REMIND: '/api/production-management-service/check-quality-mobile/get-number-remind',
    RECORD_LOT: '/api/production-management-service/check-quality-mobile/record-lot'
}

const ApiHistoryQuality = {
    GET_LIST_DATA_LOT: '/api/production-management-service/quality-inspection-history-mobile/list-data-lot/',
    GET_LIST_DATA_WITH_LOTCODE: '/api/production-management-service/quality-inspection-history-mobile/list-data-in-lot/',
    DELETE_BATCH_RECYCLING: '/api/production-management-service/quality-inspection-history-mobile/delete-batch-recycling/',
    DELETE_FAULTY_PRODUCT: '/api/production-management-service/quality-inspection-history-mobile/delete-faulty-product/',
    SIGN_CONFIRM: '/api/production-management-service/quality-inspection-history-mobile/sign-confirmation-error/',
    EDIT_RECYCLE: '/api/production-management-service/quality-inspection-history-mobile/edit-batch-recycling/',
    EDIT_ERROR_PRODUCT: '/api/production-management-service/quality-inspection-history-mobile/edit-faulty-product/',
    UPDATE_QTY_IN_LOT: '/api/production-management-service/quality-inspection-history-mobile/update-qty-in-lot'
}

const ApiProductionHT = {
    DATA_FILTER: '/api/production-management-service/record-completed-output-mobile/get-filter-completed-output/',
    GET_DATA_INFO: '/api/production-management-service/record-completed-output-mobile/get-infor-record-completed-output/',
    RECORD_HT_OUTPUT: '/api/production-management-service/record-completed-output-mobile/record-completed-output/'
}

const ApiNotification = {
    GET_LIST: '/api/hubs/notifi-mobile/get-all-approval/',
    UPDATE_IS_READ: '/api/hubs/chat/update-status-approval/'
}

const ApiMoldingRecord = {
    GET_LIST_MATERIAL_BY_WORKCENTER: '/api/production-management-service/record-casting-output-mobile/get-list-material-by-workcenter/',
    GET_LIST_WORKORDER: '/api/production-management-service/record-casting-output-mobile/get-list-workorder/',
    GET_INFO_MOLDING_RECORD: '/api/production-management-service/record-casting-output-mobile/get-infor-casting-record/',
    SUMBMIT_OUTPUT_MOLDING: '/api/production-management-service/record-casting-output-mobile/carryout-casting-output/'
}

export { ApiCommon, ApiHomeReport, ApiWorkerBegin, ApiLogin, ApiSupportWorkerEnd, ApiProductionRecord, ApiDeliveryBTP, ApiDeliveryForWash, ApiReceiveForWash, ApiDeliveryHTWareHouse, ApiPermission, ApiQC, ApiHistoryQuality, ApiProductionHT, ApiNotification, ApiMoldingRecord };
