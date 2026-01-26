/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AddStockRequestDto } from '../models/AddStockRequestDto';
import type { AdjustStockRequestDto } from '../models/AdjustStockRequestDto';
import type { InventoryResponseDto } from '../models/InventoryResponseDto';
import type { InventoryTransactionResponseDto } from '../models/InventoryTransactionResponseDto';
import type { RemoveStockRequestDto } from '../models/RemoveStockRequestDto';
import type { StationSalesStatsResponseDto } from '../models/StationSalesStatsResponseDto';
import type { UserSalesStatsResponseDto } from '../models/UserSalesStatsResponseDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class InventoryControllerService {
    /**
     * @param requestBody
     * @returns InventoryResponseDto OK
     * @throws ApiError
     */
    public static removeStock(
        requestBody: RemoveStockRequestDto,
    ): CancelablePromise<InventoryResponseDto> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/inventory/remove',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param requestBody
     * @returns InventoryResponseDto OK
     * @throws ApiError
     */
    public static adjustStock(
        requestBody: AdjustStockRequestDto,
    ): CancelablePromise<InventoryResponseDto> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/inventory/adjust',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param requestBody
     * @returns InventoryResponseDto Created
     * @throws ApiError
     */
    public static addStock(
        requestBody: AddStockRequestDto,
    ): CancelablePromise<InventoryResponseDto> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/inventory/add',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param categoryId
     * @param organizationId
     * @returns InventoryResponseDto OK
     * @throws ApiError
     */
    public static getOrganizationInventory(
        categoryId?: number,
        organizationId?: number,
    ): CancelablePromise<Array<InventoryResponseDto>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/inventory',
            query: {
                'categoryId': categoryId,
                'organizationId': organizationId,
            },
        });
    }
    /**
     * @returns StationSalesStatsResponseDto OK
     * @throws ApiError
     */
    public static getStationSalesStats(): CancelablePromise<Array<StationSalesStatsResponseDto>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/inventory/station-sales-stats',
        });
    }
    /**
     * @returns UserSalesStatsResponseDto OK
     * @throws ApiError
     */
    public static getUserSalesStats(): CancelablePromise<Array<UserSalesStatsResponseDto>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/inventory/sales-stats',
        });
    }
    /**
     * @param productId
     * @returns InventoryResponseDto OK
     * @throws ApiError
     */
    public static getProductInventory(
        productId: number,
    ): CancelablePromise<InventoryResponseDto> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/inventory/product/{productId}',
            path: {
                'productId': productId,
            },
        });
    }
    /**
     * @param productId
     * @returns InventoryTransactionResponseDto OK
     * @throws ApiError
     */
    public static getTransactionHistory(
        productId: number,
    ): CancelablePromise<Array<InventoryTransactionResponseDto>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/inventory/product/{productId}/history',
            path: {
                'productId': productId,
            },
        });
    }
}
