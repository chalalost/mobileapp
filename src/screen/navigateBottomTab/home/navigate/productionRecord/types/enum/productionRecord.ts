export enum WorkByTypeEnumMobile {
    WorkArea = 1,
    WorkCenter = 2,
    WorkUnit = 3,
    Worker = 4,
    Type = 5,
    Function = 6,
    GroupWorkDay = 7,
    WorkAreaOnlyChild = 8,
    Skill = 9,
    Provinces = 10,
    District = 11,
    Position = 12,
    Department = 13,
    Product = 14,
    Calendar = 15,
    BomSlot = 16,
    Sop = 17,
    ProductStatusBomCreate = 18,
    Model = 19,
    ApprovalFlowDefault = 20,
    Process = 21,
    Productionrequirement = 22,
    StepProcess = 23,
    Checkpoint = 24,
    Checklist = 25,
    Workorder = 26, //lay list wo by workcenterid
    Error = 27,
    WorkOrderCode = 28,
    StepByWU = 29,
    Color = 30, //mau
    MarketProduct = 31,//Thi truong
    Season = 32,//mua
    Size = 33,//kich co
    Maincodeproduct = 34,//Ma hang to
    WorkorderV2 = 35,//lay list wo by productcode
    Timeslot = 36, //Ca lam viec
    Subcodeproduct = 37,//Ma hang nho
    Customer = 38,//khach hang
    WorkerInWorkcenter = 39,//Nguoi lao dong duoc setup tren workcenter
    ReasonAbsence = 40,//ly do nghi viec
    Ordercode = 46,
    LostNote = 47,//Danh sách lý do thời gian chết

}
export enum TypeWorkcenterMobile {
    DEFAULT = 0,
    May = 1,//May
    Cat = 2,//Cat
    HoanThien = 3,//Hoan Thien
    Kho = 4,//Kho
    VanPhong = 5,//Van Phong
}
export enum WorkOrderTypeMobile {
    released = 1,
    running = 2,
    hold = 3,
    finish = 4,
    close = 5
}

export enum FilterRecord {
    Workcenterid = 1,
    Workordercode = 2,
    Maincodeproduct = 3,
    Subcodeproduct = 4,
    Colorcode = 5,
    Seasoncode = 6,
    Marketcode = 7,
    SizeCode = 8
}