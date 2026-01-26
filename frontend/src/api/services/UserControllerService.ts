/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { UserSummaryResponseDto } from '../models/UserSummaryResponseDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class UserControllerService {
    /**
     * @returns UserSummaryResponseDto OK
     * @throws ApiError
     */
    public static getOrganizationUsers(): CancelablePromise<Array<UserSummaryResponseDto>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/users',
        });
    }
}
