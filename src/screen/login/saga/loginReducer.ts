
import { LOGIN_AUTHEN_REDUCER, LOGIN_UNAUTHEN_REDUCER } from '../types/actionTypes';
import { LoginActions, UserInfoAuthenRequestAction } from '../types/types';

interface loginState {
    isAuth: boolean | false,
    userInfo: UserInfoAuthenRequestAction | null
}
const initState: loginState = {
    isAuth: false,
    userInfo: null
};

const loginReducer = (state = initState, action: LoginActions) => {
    switch (action.type) {
        case LOGIN_AUTHEN_REDUCER:
            state.isAuth = true;
            state.userInfo = action.payload
            return {
                ...state,
            };
        case LOGIN_UNAUTHEN_REDUCER:
            state.isAuth = false;
            return {
                ...state,
            };

        default:
            return {
                ...state,
            };
    }
};

export default loginReducer;
