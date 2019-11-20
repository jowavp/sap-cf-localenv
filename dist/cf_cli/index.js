"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const child_process_1 = require("child_process");
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
function getVCAP_SERVICES(app) {
    const envBuffer = child_process_1.execSync(`cf env ${app}`);
    const envStr = envBuffer.toString();
    return JSON.parse(envStr.substring(envStr.indexOf("System-Provided:") + 16, envStr.indexOf("}\n\n{") + 1).trim());
}
exports.getVCAP_SERVICES = getVCAP_SERVICES;
//# sourceMappingURL=index.js.map