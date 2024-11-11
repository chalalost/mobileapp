import { createSelector } from 'reselect';
import { AppState } from '../../../../../../reduxSaga/root/rootReducers';

const homeSelector = (state: AppState) => state.homeReducer;

export const getDataHomeSelector = createSelector(homeSelector, (homeSelector) => homeSelector.dataHome);
export const getStatusSelector = createSelector(homeSelector, (homeSelector) => homeSelector.status);
export const getErrorSelector = createSelector(homeSelector, (homeSelector) => homeSelector.error);
export const getDateTimeSelector = createSelector(homeSelector, (homeSelector) => homeSelector.date);