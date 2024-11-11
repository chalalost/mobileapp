import { LOGIN_AUTHEN_REDUCER, LOGIN_UNAUTHEN_REDUCER } from '../types/actionTypes';
import { UserInfoAuthenRequestAction, UserInfoAuthenResponseAction, UserUnAuthenResponseAction } from '../types/types';


const loginAction = {
    loginAuthenReducer: (loginInfo: UserInfoAuthenRequestAction): UserInfoAuthenResponseAction => {
        return {
            type: LOGIN_AUTHEN_REDUCER,
            payload: loginInfo
        };
    },
    logoutUnAuthenReducer: (): UserUnAuthenResponseAction => {
        return {
            type: LOGIN_UNAUTHEN_REDUCER,
        };
    }

};

export default loginAction;