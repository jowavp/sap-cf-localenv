"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getVCAP_SERVICES = exports.getAppEnv = exports.getAppGuid = exports.getOrganizationGuid = exports.getTarget = exports.getBearer = exports.getAxios = void 0;
const child_process_1 = require("child_process");
const axios_1 = __importDefault(require("axios"));
function getAxios() {
    return axios_1.default.create({
        baseURL: 'https://api.cf.eu10.hana.ondemand.com/v3',
        headers: { 'Authorization': `${getBearer()}` }
    });
}
exports.getAxios = getAxios;
function getBearer() {
    return child_process_1.execSync('cf oauth-token').toString().trim();
}
exports.getBearer = getBearer;
function getTarget() {
    const targetBuffer = child_process_1.execSync('cf target');
    return targetBuffer.toString().split("\n")
        .filter(line => line.indexOf(":") > 0)
        .reduce((acc, prop) => {
        const [key, value] = prop.split(/:(.+)/);
        acc[key.trim()] = value.trim();
        return acc;
    }, {});
}
exports.getTarget = getTarget;
function getOrganizationGuid(orgname) {
    return __awaiter(this, void 0, void 0, function* () {
        const call = getAxios(), org = (yield call.get(`/organizations?names=${orgname}`)).data.resources.find((o) => o.name === orgname);
        return org.guid;
    });
}
exports.getOrganizationGuid = getOrganizationGuid;
function getAppGuid(org_guid, appname) {
    return __awaiter(this, void 0, void 0, function* () {
        const call = getAxios(), app = (yield call.get(`/apps?organization_guids=${org_guid}`)).data.resources.find((a) => a.name === appname);
        return app.guid;
    });
}
exports.getAppGuid = getAppGuid;
function getAppEnv(org, app) {
    return __awaiter(this, void 0, void 0, function* () {
        const call = getAxios(), org_guid = yield getOrganizationGuid(org), app_guid = yield getAppGuid(org_guid, app), app_env = (yield call.get(`/apps/${app_guid}/env`)).data;
        return { VCAP_APPLICATION: app_env.application_env_json.VCAP_APPLICATION, VCAP_SERVICES: app_env.system_env_json.VCAP_SERVICES };
    });
}
exports.getAppEnv = getAppEnv;
function getVCAP_SERVICES(org, app) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield getAppEnv(org, app);
    });
}
exports.getVCAP_SERVICES = getVCAP_SERVICES;
//# sourceMappingURL=index.js.map