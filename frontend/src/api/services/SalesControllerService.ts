/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { SaleRequestDto } from '../models/SaleRequestDto';
import type { SaleResponseDto } from '../models/SaleResponseDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class SalesControllerService {
    /**
     * @param requestBody
     * @returns SaleResponseDto Created
     * @throws ApiError
     */
    public static processSale(
        requestBody: SaleRequestDto,
    ): CancelablePromise<SaleResponseDto> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/sales',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
}
