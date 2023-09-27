# sap-cf-localenv
A library that generates default-*.json files to test your Nodejs modules in an MTA application on SAP Cloud Foundry locally.
These default-*.json files will be used to connect to remote services like UAA, destination and connectivity.

> **NOTE:** This library is in an experimental phase and is only tested for CAP applications 

Only use LTS versions of [nodejs](https://nodejs.org/en/download)

The [Node Version Manager](https://github.com/nvm-sh/nvm) `nvm` is recommended for install and switching between versions

## Installation of sap-cf-localenv globally
using npm:

```bash
npm install -g sap-cf-localenv
```

## Generate the default-*.json files
In the root directory of your project, where your mta.yaml file is located, run following command:

```bash
sap-cf-localenv
```
