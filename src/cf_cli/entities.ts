export type EnvVar = {
    VCAP_SERVICES: {
        objectstore: JSON
    },
    VCAP_APPLICATION: JSON
}

export type CFObject = {
    guid: string,
    name: string
}