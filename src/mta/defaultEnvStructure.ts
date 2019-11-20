export interface DefaultEnv {
    destinations?: {
        forwardAuthToken: boolean;
        name: string;
        strictSSL: boolean;
        url: string;
    }[],
    PORT?: number
}