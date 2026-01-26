/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ProductRequestDto } from '../models/ProductRequestDto';
import type { ProductResponseDto } from '../models/ProductResponseDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class ProductControllerService {
    /**
     * @param requestBody
     * @returns ProductResponseDto Created
     * @throws ApiError
     */
    public static create(
        requestBody: ProductRequestDto,
    ): CancelablePromise<ProductResponseDto> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/products',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param id
     * @returns ProductResponseDto OK
     * @throws ApiError
     */
    public static get1(
        id: number,
    ): CancelablePromise<ProductResponseDto> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/products/{id}',
            path: {
                'id': id,
            },
        });
    }
    /**
     * @param id
     * @returns void
     * @throws ApiError
     */
    public static delete(
        id: number,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/products/{id}',
            path: {
                'id': id,
            },
        });
    }
}
