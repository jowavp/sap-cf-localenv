import { EnvVar } from './entities';
export declare function getAxios(): import("axios").AxiosInstance;
export declare function getBearer(): string;
export declare function getTarget(): {
    [key: string]: string;
};
export declare function getOrganizationGuid(orgname: string): Promise<string>;
export declare function getAppGuid(org_guid: string, appname: string): Promise<string>;
export declare function getAppEnv(org: string, app: string): Promise<EnvVar>;
export declare function getVCAP_SERVICES(org: string, app: string): Promise<EnvVar>;
