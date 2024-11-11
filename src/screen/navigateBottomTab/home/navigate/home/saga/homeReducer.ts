import { HOME_GET_DATA_REDUCER, HOME_GET_DATETIME } from '../types/actionTypes';
import { HomeActions } from '../types/types';
interface homeState {
  dataHome: string | '',
  status: boolean | false,
  error: string | '',
  date: string | ''
}
const initState: homeState = {
  dataHome: '',
  status: false,
  error: 'co loi',
  date: ''
};

const homeReducer = (state = initState, action: HomeActions) => {
  switch (action.type) {
    case HOME_GET_DATA_REDUCER:
      state.error = 'call saga success';
      return {
        ...state,
      };

    case HOME_GET_DATETIME:
      state.date = action.payload
      return {
        ...state,
      };
    default:
      return {
        ...state,
      };
  }
};

export default homeReducer;
