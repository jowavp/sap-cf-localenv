export interface DefaultEnv {
    destinations?: {
        forwardAuthToken: boolean;
        name: string;
        strictSSL: boolean;
        url: string;
    }[],
    VCAP_SERVICES?: any
    PORT?: number
}