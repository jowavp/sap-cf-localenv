export interface MtaStructure {
    ID: string;
    '_schema-version': string;
    description: string;
    parameters: {
        deploy_mode: string;
    };
    version: string;
    modules: MtaModule[];
    resources: {
        name: string;
        type: string;
        parameters: {
            [key: string]: string;
        };
    }[];
}
export interface MtaModule {
    name: string;
    type: string;
    path: string;
    parameters: {
        [key: string]: string;
    };
    requires: {
        name: string;
        group: string;
        properties: {
            forwardAuthToken: boolean;
            name: string;
            strictSSL: boolean;
            url: string;
        };
    }[];
    provides: {
        name: string;
        properties: {
            url: string;
        };
    }[];
}
