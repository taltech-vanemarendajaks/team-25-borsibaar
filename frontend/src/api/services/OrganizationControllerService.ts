/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { OrganizationRequestDto } from '../models/OrganizationRequestDto';
import type { OrganizationResponseDto } from '../models/OrganizationResponseDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class OrganizationControllerService {
    /**
     * @param id
     * @returns OrganizationResponseDto OK
     * @throws ApiError
     */
    public static get(
        id: number,
    ): CancelablePromise<OrganizationResponseDto> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/organizations/{id}',
            path: {
                'id': id,
            },
        });
    }
    /**
     * @param id
     * @param requestBody
     * @returns OrganizationResponseDto OK
     * @throws ApiError
     */
    public static update(
        id: number,
        requestBody: OrganizationRequestDto,
    ): CancelablePromise<OrganizationResponseDto> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/organizations/{id}',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @returns OrganizationResponseDto OK
     * @throws ApiError
     */
    public static getAll(): CancelablePromise<Array<OrganizationResponseDto>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/organizations',
        });
    }
    /**
     * @param requestBody
     * @returns OrganizationResponseDto Created
     * @throws ApiError
     */
    public static create1(
        requestBody: OrganizationRequestDto,
    ): CancelablePromise<OrganizationResponseDto> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/organizations',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
}
