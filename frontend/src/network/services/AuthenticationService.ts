/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Success } from '../models/Success';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class AuthenticationService {

  /**
   * Authorise User
   * Redirect user to authorisation page
   * @returns void
   * @throws ApiError
   */
  public static authoriseUser(): CancelablePromise<void> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/api/auth/authorise',
      errors: {
        302: `Successful Response`,
      },
    });
  }

  /**
   * Code Callback
   * Get an access token from a authentication code
   * @param code
   * @returns Success Successful Response
   * @throws ApiError
   */
  public static authCodeCallback(
    code: string,
  ): CancelablePromise<Success> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/api/auth/callback',
      query: {
        'code': code,
      },
      errors: {
        422: `Validation Error`,
      },
    });
  }

  /**
   * Logout
   * Redirect user to logout page
   * @returns void
   * @throws ApiError
   */
  public static logout(): CancelablePromise<void> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/api/auth/logout',
      errors: {
        302: `Successful Response`,
      },
    });
  }

}
