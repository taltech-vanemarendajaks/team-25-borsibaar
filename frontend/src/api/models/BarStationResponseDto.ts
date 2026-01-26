/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { UserSummaryResponseDto } from './UserSummaryResponseDto';
export type BarStationResponseDto = {
    id?: number;
    organizationId?: number;
    name?: string;
    description?: string;
    isActive?: boolean;
    assignedUsers?: Array<UserSummaryResponseDto>;
    createdAt?: string;
    updatedAt?: string;
};

