/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ParameterTreeStructure } from '../models/ParameterTreeStructure';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class ParameterTreeService {

  /**
   * Get Parameter Trees
   * @returns ParameterTreeStructure Successful Response
   * @throws ApiError
   */
  public static getParameterTrees(): CancelablePromise<Array<ParameterTreeStructure>> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/api/parameter-tree/trees',
    });
  }

}
