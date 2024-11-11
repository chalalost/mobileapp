import { HOME_GET_DATA_REDUCER, HOME_GET_DATA_SAGA, HOME_GET_DATETIME } from '../types/actionTypes';
import { GetDataHomeSaga, GetDataHomeSagaModel, GetDateTimeReducer } from '../types/types';

// export const getDataHomeSaga = (payload: GetDataHomeSagaModel): GetDataHomeSaga => ({
//   type: HOME_GET_DATA_SAGA,
//   payload: payload,
// });

// export const getDataHomeReducer = (payload: GetDataHomeReducerModel): GetDataHomeReducer => ({
//   type: HOME_GET_DATA_REDUCER,
//   payload: payload,
// });

const homeAction = {

  getDataHomeSaga: (typeDropdown: GetDataHomeSagaModel): GetDataHomeSaga => {
    return {
      type: HOME_GET_DATA_SAGA,
      payload: typeDropdown
    };
  },

  getDataHomeReducer: (data: string) => {
    return {
      type: HOME_GET_DATA_REDUCER,
      response: data
    };
  },

  setDateTimeReducer: (data: string): GetDateTimeReducer => {
    return {
      type: HOME_GET_DATETIME,
      payload: data
    }
  }
};
export default homeAction;