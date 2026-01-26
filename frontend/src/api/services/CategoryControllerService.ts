/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CategoryRequestDto } from '../models/CategoryRequestDto';
import type { CategoryResponseDto } from '../models/CategoryResponseDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class CategoryControllerService {
    /**
     * @param organizationId
     * @returns CategoryResponseDto OK
     * @throws ApiError
     */
    public static getAll1(
        organizationId?: number,
    ): CancelablePromise<Array<CategoryResponseDto>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/categories',
            query: {
                'organizationId': organizationId,
            },
        });
    }
    /**
     * @param requestBody
     * @returns CategoryResponseDto Created
     * @throws ApiError
     */
    public static createCategory(
        requestBody: CategoryRequestDto,
    ): CancelablePromise<CategoryResponseDto> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/categories',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param id
     * @returns CategoryResponseDto OK
     * @throws ApiError
     */
    public static getById(
        id: number,
    ): CancelablePromise<CategoryResponseDto> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/categories/{id}',
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
    public static delete1(
        id: number,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/categories/{id}',
            path: {
                'id': id,
            },
        });
    }
}
