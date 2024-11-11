import { all, fork } from 'redux-saga/effects';

import watchHome from '../../screen/navigateBottomTab/home/navigate/home/saga/homeSaga';

export function* rootSaga() {
  yield all([fork(watchHome)]);
}
// import { all } from 'redux-saga/effects';
// import watchHome from './../../components/home/saga/homeSaga';

// export default function* rootSaga() {
//   yield all([
//     watchHome
//   ]);
// }
