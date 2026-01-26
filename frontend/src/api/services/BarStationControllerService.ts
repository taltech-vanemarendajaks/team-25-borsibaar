/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { BarStationRequestDto } from '../models/BarStationRequestDto';
import type { BarStationResponseDto } from '../models/BarStationResponseDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class BarStationControllerService {
    /**
     * @param id
     * @returns BarStationResponseDto OK
     * @throws ApiError
     */
    public static getStationById(
        id: number,
    ): CancelablePromise<BarStationResponseDto> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/bar-stations/{id}',
            path: {
                'id': id,
            },
        });
    }
    /**
     * @param id
     * @param requestBody
     * @returns BarStationResponseDto OK
     * @throws ApiError
     */
    public static updateStation(
        id: number,
        requestBody: BarStationRequestDto,
    ): CancelablePromise<BarStationResponseDto> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/bar-stations/{id}',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param id
     * @returns any OK
     * @throws ApiError
     */
    public static deleteStation(
        id: number,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/bar-stations/{id}',
            path: {
                'id': id,
            },
        });
    }
    /**
     * @returns BarStationResponseDto OK
     * @throws ApiError
     */
    public static getAllStations(): CancelablePromise<Array<BarStationResponseDto>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/bar-stations',
        });
    }
    /**
     * @param requestBody
     * @returns BarStationResponseDto OK
     * @throws ApiError
     */
    public static createStation(
        requestBody: BarStationRequestDto,
    ): CancelablePromise<BarStationResponseDto> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/bar-stations',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @returns BarStationResponseDto OK
     * @throws ApiError
     */
    public static getUserStations(): CancelablePromise<Array<BarStationResponseDto>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/bar-stations/user',
        });
    }
}
