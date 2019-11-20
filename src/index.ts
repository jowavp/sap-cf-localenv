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

const createJsonFile = (module: MtaModule, fileName: "default-env" | "default-services", data: any) => {
    if(!data) return;
    if (!fs.existsSync(`./${module.path}`)){
        fs.mkdirSync(`./${module.path}`);
    }
    console.log(`${fileName} generated for ${module.name}`)
    if( module.provides ){
        fs.writeFileSync(`./${fileName}.json`, JSON.stringify(data, null, '\t') );
    }
    fs.writeFileSync(`./${module.path}/${fileName}.json`, JSON.stringify(data, null, '\t') );
}

// get the different modules in the mta
mta.modules.filter( (module) => module.type.indexOf('nodejs') > -1 )
    .forEach(
    (module) => {
        const VCAP = cf.getVCAP_SERVICES(module.name);
        
        const defaultServices = 
            Object.values(VCAP.VCAP_SERVICES).reduce<any>(
                (acc, [service]: any) => {
                    acc[service.label] = service.credentials;
                    if( service.label === 'xsuaa') {
                        acc['uaa'] = service.credentials;
                    }
                    return acc;
                }, {}
            );

        createJsonFile(module, "default-services", defaultServices)        
        
        const defaultEnv = (module.requires || []).filter( req => req.group === 'destinations' ).reduce<DefaultEnv | null>(
            (acc, req) => {
                if(!acc) acc = {};
                if(!acc.destinations)acc.destinations = [];
                // write a default-env.json file
                req.properties.url = req.properties.url.replace('~{url}', 'http://localhost:4004');
                acc.destinations.push(req.properties);
                return acc;
            }, null
        );
        
        createJsonFile(module, "default-env", defaultEnv)    
    }
)
   

