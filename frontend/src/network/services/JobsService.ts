/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ClusterFormSubmission } from '../models/ClusterFormSubmission';
import type { ClusterFormSubmissionResponse } from '../models/ClusterFormSubmissionResponse';
import type { DeleteJobResponse } from '../models/DeleteJobResponse';
import type { JobSummaryResponse } from '../models/JobSummaryResponse';
import type { JobTokenList } from '../models/JobTokenList';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
import {ClusterFormSubmissionLocal} from "../models/ClusterFormSubmissionLocal";
import {ClusterFormSubmissionDeployment} from "../models/ClusterFormSubmissionDeployment";

export class JobsService {

  /**
   * Submit Job
   * Submit a job to the cluster whilst running in local mode
   * @param requestBody
   * @returns ClusterFormSubmissionResponse Successful Response
   * @throws ApiError
   */
  public static submitLocalJob(
    requestBody: ClusterFormSubmissionLocal,
  ): CancelablePromise<ClusterFormSubmissionResponse> {
    return __request(OpenAPI, {
      method: 'POST',
      url: '/api/job/submit/local',
      body: requestBody,
      mediaType: 'application/json',
      errors: {
        422: `Validation Error`,
      },
    });
  }

  /**
   * Submit Job
   * Submit a job to the cluster whilst running in deployment mode
   * @param requestBody
   * @param autoError
   * @returns ClusterFormSubmissionResponse Successful Response
   * @throws ApiError
   */
  public static submitDeploymentJob(
    requestBody: ClusterFormSubmissionDeployment,
    autoError?: any,
  ): CancelablePromise<ClusterFormSubmissionResponse> {
    return __request(OpenAPI, {
      method: 'POST',
      url: '/api/job/submit/deployment',
      query: {
        'auto_error': autoError,
      },
      body: requestBody,
      mediaType: 'application/json',
      errors: {
        422: `Validation Error`,
      },
    });
  }

  /**
   * Get Job Status
   * @param token
   * @returns any Return the scan data and logs in msgpack format
   * @throws ApiError
   */
  public static getJobStatus(
    token: string,
  ): CancelablePromise<any> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/api/job/status',
      query: {
        'token': token,
      },
      errors: {
        422: `Validation Error`,
      },
    });
  }

  /**
   * Delete Job
   * @param requestBody
   * @returns DeleteJobResponse Successful Response
   * @throws ApiError
   */
  public static deleteJobs(
    requestBody: JobTokenList,
  ): CancelablePromise<DeleteJobResponse> {
    return __request(OpenAPI, {
      method: 'DELETE',
      url: '/api/jobs/delete',
      body: requestBody,
      mediaType: 'application/json',
      errors: {
        422: `Validation Error`,
      },
    });
  }

  /**
   * Get Job Summary
   * @param requestBody
   * @returns JobSummaryResponse Successful Response
   * @throws ApiError
   */
  public static getJobs(
    requestBody: JobTokenList,
  ): CancelablePromise<Array<JobSummaryResponse>> {
    return __request(OpenAPI, {
      method: 'POST',
      url: '/api/jobs/summary',
      body: requestBody,
      mediaType: 'application/json',
      errors: {
        422: `Validation Error`,
      },
    });
  }

}
