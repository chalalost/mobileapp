export interface INotification {
    Id: string | "",
    Title: string | "",
    IsRead: boolean | false,
    Status: number | 0,
    UserTo: string | "",
    CreateBy: string | "",
    UpdateBy: string | "",
    UserFrom: string | "",
    CreateDate: string | "",
    UpdateDate: string | "",
    JsonMessage: string | "",
    BusinessType: number | 0,
    Workcenterid: string | "",
    MessageContent: string | "",
    BusinessServiceType: number | 0,
}

export interface IJsonMessage {
    BusinessType: number | 0,
    Workordercode: string | '',
    Workcentername: string | '',
    Mainproductcode: string | '',
    Qtyold: string | '',
    Qtycurrent: string | '',
    Obj: string | '',
    Status: number | 0
}

export interface IDataNotifi {
    items: IItemNotification[],
    pageIndex: number | 0,
    pageSize: number | 0,
    totalCount: number | 0,
}

export interface IItemNotification {
    id: string | '',
    info: string | ''
}

export const typeBusiness = {
    SendNotiApproval: 1,// luong phe duyet
    SendReportRecordProduction: 2,// báo cáo ghi nhận sản lượng
    SendNotiUpdateWorkorder: 3,//cập nhật lệnh sản xuất
    SendOutputRecordingWarning: 4,//cảnh báo chưa ghi nhận sản lượng
    SendMailDailyProductionProgress: 5,//Gửi mail báo cáo tiến độ sản xuất hàng ngày
    WarningNotedOutputNoti: 6,//gửi noti web chưa ghi nhan san luong
    OuputBondWarning: 7,//Cảnh báo ghi nhận sản lượng nhỏ hơn khoán 90%
    NotiWorkorderStatusChange: 8,//Thay đổi trạng thái lệnh sản xuất thành hủy hoặc hoàn thành
};
export const workOrderType =
{
    released: 1,//khởi tạo
    running: 2,//đang chạy
    hold: 3,//tạm dừng
    finish: 4,//hoàn thành
    close: 5,//hủy
};