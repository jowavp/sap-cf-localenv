#!/usr/bin/env node
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs = __importStar(require("fs"));
const yaml_1 = __importDefault(require("yaml"));
const cf = __importStar(require("./cf_cli"));
// check the installation of CF-cli
const target = cf.getTarget();
console.log(`Search for the configuration in org: ${target.org} space: ${target.space}`);
// read the mta file in the current directory
const mtaFile = fs.readFileSync('./mta.yaml', 'utf8');
const mta = yaml_1.default.parse(mtaFile);
console.log(`Starting to configure your environment for application ${mta.ID}`);
const createJsonFile = (module, fileName, data) => {
    if (!data)
        return;
    if (!fs.existsSync(`./${module.path}`)) {
        fs.mkdirSync(`./${module.path}`);
    }
    console.log(`${fileName} generated for ${module.name}`);
    if (module.provides) {
        fs.writeFileSync(`./${fileName}.json`, JSON.stringify(data, null, '\t'));
    }
    fs.writeFileSync(`./${module.path}/${fileName}.json`, JSON.stringify(data, null, '\t'));
    if (module.path === "approuter" && fs.existsSync('./localApprouter')) {
        fs.writeFileSync(`./localApprouter/${fileName}.json`, JSON.stringify(data, null, '\t'));
        console.log(`${fileName} generated for localApprouter`);
    }
};
// get the different modules in the mta
mta.modules.filter((module) => module.type.indexOf('nodejs') > -1)
    .forEach((module) => {
    const VCAP = cf.getVCAP_SERVICES(module.name);
    const defaultServices = Object.values(VCAP.VCAP_SERVICES).reduce((acc, [service]) => {
        acc[service.label] = service.credentials;
        if (service.label === 'xsuaa') {
            acc['uaa'] = service.credentials;
        }
        return acc;
    }, {});
    createJsonFile(module, "default-services", defaultServices);
    const defaultEnv = (module.requires || []).reduce((acc, req) => {
        const resource = mta.resources.find(x => x.name === req.name);
        if (!acc)
            acc = {};
        if (req.group && req.group === 'destinations') {
            if (!acc.destinations)
                acc.destinations = [];
            // write a default-env.json file
            req.properties.url = req.properties.url.replace('~{url}', 'http://localhost:4004');
            acc.destinations.push(req.properties);
        }
        else if (resource && resource.type === 'com.sap.xs.hdi-container') {
            if (!acc.VCAP_SERVICES)
                acc.VCAP_SERVICES = [];
            acc.VCAP_SERVICES = VCAP.VCAP_SERVICES;
        }
        return acc;
    }, null);
    createJsonFile(module, "default-env", defaultEnv);
    // if the module is bound to an instance of the objectstore service, also generate a default-vcapfile.json
    let objectStoreResource = mta.resources.find(resource => module.requires.map(require => require.name).includes(resource.name) && resource.type === "objectstore");
    if (objectStoreResource) {
        const defaultVcap = {
            "services": {
                "objectstore": VCAP.VCAP_SERVICES.objectstore
            }
        };
        createJsonFile(module, "default-vcapfile", defaultVcap);
    }
});
//# sourceMappingURL=index.js.map