#!/usr/bin/env node
import * as fs from 'fs';
import YAML from 'yaml';
import { MtaStructure, MtaModule } from './mta/mtaStructure';
import * as cf from './cf_cli';
import { DefaultEnv } from './mta/defaultEnvStructure';
// check the installation of CF-cli

const target = cf.getTarget();
console.log(`Search for the configuration in org: ${target.org} space: ${target.space}`);

// read the mta file in the current directory
const mtaFile = fs.readFileSync('./mta.yaml', 'utf8');
const mta: MtaStructure = YAML.parse(mtaFile)

console.log(`Starting to configure your environment for application ${mta.ID}`);

const createJsonFile = (module: MtaModule, fileName: "default-env" | "default-services" | "default-vcapfile", data: any) => {
    if (!data) return;
    if (!fs.existsSync(`./${module.path}`)) {
        fs.mkdirSync(`./${module.path}`);
    }
    console.log(`${fileName} generated for ${module.name}`)
    if (module.provides) {
        fs.writeFileSync(`./${fileName}.json`, JSON.stringify(data, null, '\t'));
    }
    fs.writeFileSync(`./${module.path}/${fileName}.json`, JSON.stringify(data, null, '\t'));
    if (module.path === "approuter" && fs.existsSync('./localApprouter')) {
        fs.writeFileSync(`./localApprouter/${fileName}.json`, JSON.stringify(data, null, '\t'));
        console.log(`${fileName} generated for localApprouter`)
    }
}

// get the different modules in the mta
mta.modules.filter((module) => module.type.indexOf('nodejs') > -1)
    .forEach(
        (module) => {
            const VCAP = cf.getVCAP_SERVICES(module.name);

            const defaultServices =
                Object.values(VCAP.VCAP_SERVICES).reduce<any>(
                    (acc, [service]: any) => {
                        acc[service.label] = service.credentials;
                        if (service.label === 'xsuaa') {
                            acc['uaa'] = service.credentials;
                        }
                        return acc;
                    }, {}
                );

            createJsonFile(module, "default-services", defaultServices)

            const defaultEnv = (module.requires || []).reduce<DefaultEnv | null | undefined>(
                (acc, req) => {
                    const resource = mta.resources.find(x => x.name === req.name);
                    if (!acc) acc = {};
                    if (req.group && req.group === 'destinations') {
                        if (!acc.destinations) acc.destinations = [];
                        // write a default-env.json file
                        req.properties.url = req.properties.url.replace('~{url}', 'http://localhost:4004');
                        acc.destinations.push(req.properties);
                    } else if (resource && resource.type === 'com.sap.xs.hdi-container') {
                        if (!acc.VCAP_SERVICES) acc.VCAP_SERVICES = [];
                        acc.VCAP_SERVICES = VCAP.VCAP_SERVICES;
                    }
                    return acc;
                }, null
            );

            createJsonFile(module, "default-env", defaultEnv)

            // if the module is bound to an instance of the objectstore service, also generate a default-vcapfile.json
            let objectStoreResource = mta.resources.find(resource => module.requires.map(require => require.name).includes(resource.name) && resource.type === "objectstore");
            if (objectStoreResource) {
                const defaultVcap = {
                    "services": {
                        "objectstore": VCAP.VCAP_SERVICES.objectstore
                    }
                }
                createJsonFile(module, "default-vcapfile", defaultVcap)
            }

        }
    )
