import { createSelector } from 'reselect';
import { AppState } from '../../../../../../reduxSaga/root/rootReducers';

const recordSelector = (state: AppState) => state.productionRecordReducer;

export const dataPageRecordSX = createSelector(recordSelector, (recordSelector) => recordSelector.dataPageRecordSX);
export const dropdownWorkOrderCode = createSelector(recordSelector, (recordSelector) => recordSelector.lstDropdownOrderCode);
export const dropdownColor = createSelector(recordSelector, (recordSelector) => recordSelector.lstDropdownColor);
export const dropdownSubCode = createSelector(recordSelector, (recordSelector) => recordSelector.lstDropdownSubCode);
export const dropdownSeason = createSelector(recordSelector, (recordSelector) => recordSelector.lstDropdownSeason);
export const dropdownMarket = createSelector(recordSelector, (recordSelector) => recordSelector.lstDropdownMarket);
export const dropdownSize = createSelector(recordSelector, (recordSelector) => recordSelector.lstDropdownSize);
export const userScan = createSelector(recordSelector, (recordSelector) => recordSelector.userScan);
export const isScan = createSelector(recordSelector, (recordSelector) => recordSelector.isScan);
