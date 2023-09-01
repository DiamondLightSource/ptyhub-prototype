/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { DataCollection } from '../models/DataCollection';
import type { ProcessedJob } from '../models/ProcessedJob';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class DataCollectionService {

  /**
   * Get Data Collection
   * @param dataCollectionId
   * @param autoError
   * @returns DataCollection Successful Response
   * @throws ApiError
   */
  public static getDataCollection(
    dataCollectionId: number,
    autoError?: any,
  ): CancelablePromise<DataCollection> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/api/data-collection/',
      query: {
        'data_collection_id': dataCollectionId,
        'auto_error': autoError,
      },
      errors: {
        422: `Validation Error`,
      },
    });
  }

  /**
   * Get Data Collection
   * @param dataCollectionId
   * @param autoError
   * @returns ProcessedJob Successful Response
   * @throws ApiError
   */
  public static getProcessedJobs(
    dataCollectionId: number,
    autoError?: any,
  ): CancelablePromise<Array<ProcessedJob>> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/api/data-collection/processed-jobs',
      query: {
        'data_collection_id': dataCollectionId,
        'auto_error': autoError,
      },
      errors: {
        422: `Validation Error`,
      },
    });
  }

}
