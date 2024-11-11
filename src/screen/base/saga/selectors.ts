import { createSelector } from 'reselect';
import { AppState } from '../../../reduxSaga/root/rootReducers';

const baseSelector = (state: AppState) => state.baseReducer;

export const isSpinner = createSelector(baseSelector, (baseSelector) => baseSelector.isSpinner);
export const textSpinner = createSelector(baseSelector, (baseSelector) => baseSelector.textSpinner);
export const listMenu = createSelector(baseSelector, (baseSelector) => baseSelector.listMenu);
export const listActionMenu = createSelector(baseSelector, (baseSelector) => baseSelector.listActionMenu);

export const menuSelected = createSelector(baseSelector, (baseSelector) => baseSelector.menuSelected);
export const listMenuChild = createSelector(baseSelector, (baseSelector) => baseSelector.listMenuChild);
export const listActionForMenuSelected = createSelector(baseSelector, (baseSelector) => baseSelector.listActionForMenuSelected);





