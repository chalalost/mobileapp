import {
    SET_SPINNER_REDUCER, SpinnerActionModel,
    PermissionRequestAction,
    PermissionResponseAction, OnPressMenuResponseAction, IchangeMenuRequest
} from '../typeBase/type';


const baseAction = {
    setSpinnerReducer: (spinModel: SpinnerActionModel) => {
        return {
            type: SET_SPINNER_REDUCER,
            payload: spinModel
        };
    },
    setPermission: (dataPermission: PermissionRequestAction): PermissionResponseAction => {
        return {
            type: 'SET_PERMISSION_REDUCER',
            payload: dataPermission
        };
    },
    // type==1 => menu bottom, type ==2 menu slide left
    onPressMenu: (data: IchangeMenuRequest): OnPressMenuResponseAction => {
        return {
            type: 'ONPRESS_MENU_PERMISSION',
            payload: data
        };
    }
};

export default baseAction;