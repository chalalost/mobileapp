import { call, put, takeEvery } from 'redux-saga/effects';
import { HOME_GET_DATA_SAGA } from '../types/actionTypes';
import { GetDataHomeSaga } from '../types/types';
import homeAction from './homeAction';
import { getDataHomeService } from './homeService';

type inputSaga = ReturnType<typeof homeAction.getDataHomeSaga>;

export function* getDataSaga({ type, payload }: GetDataHomeSaga) {
  const data = '212';
  const response: string = yield call(getDataHomeService, data);
  if (response !== '')
    yield put(homeAction.getDataHomeReducer(data));
}

export default function* watchHome() {
  yield takeEvery(HOME_GET_DATA_SAGA, getDataSaga);
}