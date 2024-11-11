
import { LOGIN_AUTHEN_REDUCER, LOGIN_UNAUTHEN_REDUCER } from './actionTypes';

export interface UserInfoAuthenRequestAction {
    userId: string | '';
    userName: string | '';
    token: string | '';
    refreshtoken: string | '';
    expairesIn: number | 0
}

export type UserInfoAuthenResponseAction = {
    type: typeof LOGIN_AUTHEN_REDUCER;
    payload: UserInfoAuthenRequestAction;
};

export type UserUnAuthenResponseAction = {
    type: typeof LOGIN_UNAUTHEN_REDUCER;
};


export type LoginActions =
    | UserInfoAuthenResponseAction
    | UserUnAuthenResponseAction
    ;