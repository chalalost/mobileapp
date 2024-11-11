export const SET_SPINNER_REDUCER = 'SET_SPINNER_REDUCER';
export const SET_PERMISSION_REDUCER = 'SET_PERMISSION_REDUCER';
export const ONPRESS_MENU_PERMISSION = 'ONPRESS_MENU_PERMISSION';




export interface IMenu {
    MenuId: string | '',
    MenuName: string | '',
    MenuTitle: string | '',
    MenuType: number | 0,
    Parent: null,
    ActionApi: number | 0,
    ActionCode: string | '',
    Status: number | 0,
    IsMenuAction: boolean | false,
    IsHorizontal: boolean | false,
    Islevel: number | 0,
    IsDefault: boolean | false,
    comPath: string | '',
    path: string | '',
    imagePath: string | '',
    sortOrder: number | 0,
    MenuFor: number | 0,
}

export interface IActionMenu {
    Id: string | ''
    ActionName: string | ''
    ActionCodeApi: string | ''
    ActionTitle: string | ''
    PathName: string | ''
    IsActive: true,
    Status: number | 0
    MenuId: string | ''
}

export interface IchangeMenuRequest {
    ScreenName: string | ''
    Type: Number | 0
}


export type SpinnerActionModel = {
    isSpinner: boolean | false,
    textSpinner: string | '',
};

export type SetSpinnerAction = {
    type: typeof SET_SPINNER_REDUCER;
    payload: SpinnerActionModel
};


export type PermissionRequestAction = {
    listMenu: IMenu[],
    listActionMenu: IActionMenu[],
    listConfigSystem: IListConfigSystem[]
};

export interface IListConfigSystem {
    configId: string | '',
    configName: string | '',
    type: number | 0
}

export type PermissionResponseAction = {
    type: typeof SET_PERMISSION_REDUCER;
    payload: PermissionRequestAction
};

export type OnPressMenuResponseAction = {
    type: typeof ONPRESS_MENU_PERMISSION;
    payload: IchangeMenuRequest
};

export type SpinnerActions =
    | SetSpinnerAction
    | PermissionResponseAction
    | OnPressMenuResponseAction
    ;
