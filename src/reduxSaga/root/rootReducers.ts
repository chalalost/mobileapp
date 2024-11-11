import { combineReducers } from 'redux';
import homeReducer from '../../screen/navigateBottomTab/home/navigate/home/saga/homeReducer';
import loginReducer from '../../screen/login/saga/loginReducer';
import productionRecordReducer from '../../screen/navigateBottomTab/home/navigate/productionRecord/saga/productionRecordReducer';
import baseReducer from '../../screen/base/saga/reducer';

const rootReducer = combineReducers({
  homeReducer,
  loginReducer,
  productionRecordReducer,
  baseReducer
});
export type AppState = ReturnType<typeof rootReducer>;
export default rootReducer;
