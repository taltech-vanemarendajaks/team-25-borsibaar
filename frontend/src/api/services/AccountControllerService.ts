/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { MeResponse } from '../models/MeResponse';
import type { onboardingRequest } from '../models/onboardingRequest';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class AccountControllerService {
    /**
     * @param requestBody
     * @returns any OK
     * @throws ApiError
     */
    public static finish(
        requestBody: onboardingRequest,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/account/onboarding',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @returns MeResponse OK
     * @throws ApiError
     */
    public static me(): CancelablePromise<MeResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/account',
        });
    }
}
