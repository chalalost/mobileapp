import { createSelector } from 'reselect';
import { AppState } from '../../../reduxSaga/root/rootReducers';

const loginSelector = (state: AppState) => state.loginReducer;

export const isAuthSelector = createSelector(loginSelector, (loginSelector) => loginSelector.isAuth);
export const userInfoSelector = createSelector(loginSelector, (loginSelector) => loginSelector.userInfo);
