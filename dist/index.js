#!/usr/bin/env node
"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
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
    const defaultEnv = (module.requires || []).filter(req => req.group === 'destinations').reduce((acc, req) => {
        if (!acc)
            acc = {};
        if (!acc.destinations)
            acc.destinations = [];
        // write a default-env.json file
        req.properties.url = req.properties.url.replace('~{url}', 'http://localhost:4004');
        acc.destinations.push(req.properties);
        return acc;
    }, null);
    createJsonFile(module, "default-env", defaultEnv);
});
//# sourceMappingURL=index.js.map