export interface ResponseDataAuthen {
    Data: any | null
    DataNew: any | null
    MesageStatus: String | ''
    Message: string | ''
    Status: number | 0
    StatusCode: number | 0
    Success: boolean | false
}

export interface ResponseDataService {
    data: any | null
    isSuccess: boolean | false
    message: string | false
    status: number | 0
}

export type ResponseData =
    | ResponseDataAuthen
    | ResponseDataService;

