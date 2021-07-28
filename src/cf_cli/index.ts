
import { execSync } from 'child_process';
import { EnvVar, CFObject } from './entities';
import axios from 'axios';

export function getAxios() {
    return axios.create({
        baseURL: 'https://api.cf.eu10.hana.ondemand.com/v3',
        headers: { 'Authorization': `${getBearer()}` }
    });
}

export function getBearer(): string {
    return execSync('cf oauth-token').toString().trim()
}

export function getTarget() {
    const targetBuffer = execSync('cf target');
    return targetBuffer.toString().split("\n")
        .filter(line => line.indexOf(":") > 0)
        .reduce<{ [key: string]: string }>((acc, prop) => {
            const [key, value] = prop.split(/:(.+)/);
            acc[key.trim()] = value.trim();
            return acc;
        }, {});
}

export async function getOrganizationGuid(orgname: string): Promise<string> {
    const call = getAxios(), org = (await call.get(`/organizations?names=${orgname}`)).data.resources.find((o: CFObject) => o.name === orgname);
    return org.guid;
}

export async function getAppGuid(org_guid: string, appname: string): Promise<string> {
    const call = getAxios(), app = (await call.get(`/apps?organization_guids=${org_guid}`)).data.resources.find((a: CFObject) => a.name === appname);
    return app.guid;
}

export async function getAppEnv(org: string, app: string): Promise<EnvVar> {
    const call = getAxios(), org_guid = await getOrganizationGuid(org), app_guid = await getAppGuid(org_guid, app), app_env = (await call.get(`/apps/${app_guid}/env`)).data;
    return { VCAP_APPLICATION: app_env.application_env_json.VCAP_APPLICATION, VCAP_SERVICES: app_env.system_env_json.VCAP_SERVICES };
}

export async function getVCAP_SERVICES(org: string, app: string): Promise<EnvVar> {
    return await getAppEnv(org, app);
}