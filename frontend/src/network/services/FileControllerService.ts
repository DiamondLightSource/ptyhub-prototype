/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Directory } from '../models/Directory';
import type { DirectoryCreate } from '../models/DirectoryCreate';
import type { FileRead } from '../models/FileRead';
import type { FileWrite } from '../models/FileWrite';
import type { Success } from '../models/Success';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class FileControllerService {

  /**
   * Get Directory
   * @param path
   * @returns Directory Successful Response
   * @throws ApiError
   */
  public static getDirectoryContent(
    path: string,
  ): CancelablePromise<Directory> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/api/file-controller/directory',
      query: {
        'path': path,
      },
      errors: {
        422: `Validation Error`,
      },
    });
  }

  /**
   * Write To File
   * @param requestBody
   * @returns Success Successful Response
   * @throws ApiError
   */
  public static writeToFile(
    requestBody: FileWrite,
  ): CancelablePromise<Success> {
    return __request(OpenAPI, {
      method: 'POST',
      url: '/api/file-controller/file',
      body: requestBody,
      mediaType: 'application/json',
      errors: {
        422: `Validation Error`,
      },
    });
  }

  /**
   * Read File
   * @param path
   * @returns FileRead Successful Response
   * @throws ApiError
   */
  public static readFile(
    path: string,
  ): CancelablePromise<FileRead> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/api/file-controller/file',
      query: {
        'path': path,
      },
      errors: {
        422: `Validation Error`,
      },
    });
  }

  /**
   * Create Directory
   * @param requestBody
   * @returns Success Successful Response
   * @throws ApiError
   */
  public static createDirectory(
    requestBody: DirectoryCreate,
  ): CancelablePromise<Success> {
    return __request(OpenAPI, {
      method: 'POST',
      url: '/api/file-controller/create-directory',
      body: requestBody,
      mediaType: 'application/json',
      errors: {
        422: `Validation Error`,
      },
    });
  }

}
