import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { NavigationProp } from '@react-navigation/native';
import { ResponseData } from './typeNetwork';
import { connect, useDispatch, useSelector } from "react-redux";
import loginAction from './../../login/saga/loginAction';
import { call } from 'redux-saga/effects';
import Storage from '../storage/storage';
import { IGateway } from '../app/gateway';
import { useEffect, useState } from 'react';
import { ApiGateway } from './apiGateway';
import { Alert, Platform, ToastAndroid } from 'react-native';

let api: string;


const CommonBase = {

  get<T>(api: string, data: unknown, onSuccess: Function, onError: Function): void {
    axios.get<T>(api, {
      params: data,
    })
      .then(function (response) {
        if (onSuccess) onSuccess(response.data);
      })
      .catch(function (error) {
        if (onError) onError(error);
      });
  },

  post<T>(api: string, data: unknown, onSuccess: Function, onError: Function) {
    const config: AxiosRequestConfig = { headers: { 'Content-Type': 'application/json' } };
    axios
      .post<T>(api, data, config)
      .then(function (response) {
        if (onSuccess) onSuccess(response.data);
      })
      .catch(function (error) {
        if (onError) onError(error);
      });
  },

  async getAsync<T>(api: string, data: unknown) {
    try {
      let apiGateway: string = await this.getApiGateway();
      if (apiGateway !== "") {
        const config: AxiosRequestConfig = { params: data, headers: { 'Content-Type': 'application/json' } };
        const result = await axios.get<T>(apiGateway + api, { params: config });
        if (result.status == 401) {
          // call lại get token bằng refresh tken
          // call logout nếu call lỗi or hết hạn
          const dispatch = useDispatch();
          dispatch(loginAction.logoutUnAuthenReducer())
        }

        return result.data;
      } else {
        // cảnh báo chưa set url api
        //api = ApiGateway.DEFAULT_API
        // điều hướng về login
        const dispatch = useDispatch();
        dispatch(loginAction.logoutUnAuthenReducer())
        let msg = 'Vui lòng đăng ký url nhà máy!'
        if (Platform.OS === 'android') {
          ToastAndroid.show(msg, ToastAndroid.LONG)
        } else {
          Alert.alert(msg)
        }
      }
    } catch (error: any) {
      let mes = (error as Error).message
      //ToastAndroid.show(mes, ToastAndroid.LONG)
      return mes;
    }
  },

  async postAsync<T>(api: string, data: unknown) {
    try {
      let apiGateway: string = await this.getApiGateway();
      if (apiGateway !== "") {
        const config: AxiosRequestConfig = { headers: { 'Content-Type': 'application/json' } };
        const result = await axios.post<T>(apiGateway + api, data, { params: config });
        if (result.status == 401) {
          // call lại get token bằng refresh tken
          // call logout nếu call lỗi or hết hạn

          const dispatch = useDispatch();
          dispatch(loginAction.logoutUnAuthenReducer())
        }
        return result.data;
      }
      else {
        // cảnh báo chưa set url api
        //api = ApiGateway.DEFAULT_API
        // điều hướng về login
        // const dispatch = useDispatch();
        // dispatch(loginAction.logoutUnAuthenReducer())
        let msg = 'Vui lòng đăng ký url nhà máy!'
        if (Platform.OS === 'android') {
          ToastAndroid.show(msg, ToastAndroid.LONG)
        } else {
          Alert.alert(msg)
        }
        return '';
      }
    } catch (error) {
      let mes = (error as Error).message
      //ToastAndroid.show(mes, ToastAndroid.LONG)
      return (error as Error).message;
      // if (axios.isAxiosError(error)) {
      //   return error.message;
      // } else {
      //   const dataError = (error as Error).message;
      // }
    }
  },

  setAuthHeader(token: string) {
    axios.defaults.headers.common["Authorization"] = token
      ? "Bearer " + token
      : "";
  },

  async getApiGateway() {
    let apiGateway: string = "";
    const gatewayObj: IGateway[] = JSON.parse(await Storage.getItem('gateways') || '[]')
    if (gatewayObj != null && gatewayObj.length > 0) {
      const defaultApi: IGateway | undefined = gatewayObj.find((gateway: any) => gateway.isDefault === true);
      if (defaultApi != undefined && defaultApi.port.length > 0) {
        apiGateway = defaultApi.port;
      }
      else {
        apiGateway = "";
      }
    }
    return apiGateway;
  },
};

export default CommonBase;


