
import { execSync } from 'child_process'

export function getTarget() {
    const targetBuffer = execSync('cf target');
    return targetBuffer.toString().split("\n")
    .filter( line => line.indexOf(":") > 0 )
    .reduce<{[key: string]: string}>( (acc, prop) => { 
        const [key, value] = prop.split(/:(.+)/);
        acc[key.trim()] = value.trim();
        return acc; 
    }, {} );
}

export function getVCAP_SERVICES(app: string) {
    const envBuffer = execSync(`cf env ${app}`);
    const envStr = envBuffer.toString();
    return JSON.parse( envStr.substring(envStr.indexOf("System-Provided:") + 16, envStr.indexOf("}\n\n{") + 1).trim() );
}