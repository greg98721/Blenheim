# Basic Install Notes

## Introduction

A sample project to show using a single repository to hold the client, server and common code (monorepos implies a single repos across a company - this ain't that).

Using Angular for the client, Nest.js for the server, npm workspaces to link it the build togeather and composite Typescript projects to link the compilation.
Also demonstrates configuring VS Code to work with them all.

## Create Root Folder

Name of the project will be significant

## Create the GIT Repository

```PS
git init
```

Copy in a standard `.gitignore` from another angular project. Modify `/node_modules` to `**/node_modules`.
As angular project is no longer at the root of the repository

## Create the Root package.json

```json
{
  "name": "blenheim",
  "workspaces": []
}
```

Create the packages folder in the root

## Install Client

Change to the packages folder

```PS
ng n blenheim-client --style scss --routing true --ssr true --skip-git true --skip-install true
```

In the root packages folder add `packages/blenheim-client` to the workspaces

Add yarn to npm global with `npm i yarn -g`

## Install Server

[Nest Documentation](https://docs.nestjs.com/cli/usages#nest-new)

If required install Nest into Node:

```PS
npm i -g @nestjs/cli
```

Then create the app:

```PS
nest n blenheim-server --package-manager npm --language ts --strict --skip-git --skip-install
```

In the root packages folder add `packages/blenheim-server` to the workspaces

## Configure VS Code to look nicer with a monorepos using VS Code Workspaces

[VS Code Docs](https://code.visualstudio.com/docs/editor/multi-root-workspaces)

Create a file `Blenheim.code.workspace`. When you open this project as a workspace in VS Code `File/Open Workspace from File...`, it will show the 3 root folders cleanly. The names are uppercase to stick out.

```json
{
  "folders": [
    {
      "name": "ROOT",
      "path": "./"
    },
    {
      "name": "BLENHEIM CLIENT",
      "path": "packages/blenheim-client"
    },
    {
      "name": "BLENHEIM SERVER",
      "path": "packages/blenheim-server"
    }
  ],
  "settings": {
    "files.exclude": {
      "node_modules/": true,
      "packages/": true,
      "**/dist": true,
      "**/.angular": true
    }
  }
}
```

## Create the model library common to both projects

- In the packages folder create a new folder `blenheim-model`
- Extend `Blenheim.code.workspace` with the following folder

```json
{
  "name": "BLENHEIM MODEL",
  "path": "packages/blenheim-model"
}
```

- Create a tsconfig.json file for the library. Note the composite and declarationMap settings

```json
{
  "compileOnSave": false,
  "compilerOptions": {
    "lib": ["ES2022"],
    "module": "commonjs",
    "moduleResolution": "Node",
    "declaration": true,
    "removeComments": true,
    "emitDecoratorMetadata": true,
    "composite": true,
    "experimentalDecorators": true,
    "allowSyntheticDefaultImports": true,
    "target": "ES2022",
    "sourceMap": true,
    "outDir": "./dist",
    "incremental": true,
    "skipLibCheck": false,
    "strictNullChecks": true,
    "noImplicitAny": true,
    "strictBindCallApply": true,
    "forceConsistentCasingInFileNames": true,
    "noFallthroughCasesInSwitch": true,
    "declarationMap": true,
    "inlineSources": true,
    "types": []
  },
  "include": ["src/**/*", "index.ts"]
}
```

- Note the module type is commonjs - which is required by Nest.js, but Angular moans about it as not possible to tree-shake a commonjs module. Add the following to `build/options` in the the angular.json file to stop the moaning.
```json
"allowedCommonJsDependencies": [ "@blenheim/model"]
```
- Create a package.json file. Note we are setting the main and type definitions to the index.ts in the root. Note the version number - this will be important for the dependencies in the apps. The Typescript version is the least common denominator between the two apps.

```json
{
  "name": "@blenheim/model",
  "version": "0.0.1",
  "private": true,
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "scripts": {
    "prebuild": "rimraf dist",
    "build": "tsc"
  },
  "dependencies": {},
  "devDependencies": {
    "typescript": "~5.2.2",
    "rimraf": "^5.0.5"
  }
}
```

- Create a src folder. This will contain all the model code.
- Create a index.ts file. This will single point that in turn will export the contents of the src folder. For example if we had src/test.ts only, then index.ts would consist of...

```ts
export * from './src/test'
```

- Now we need to add the references to the model library to the two applications. There are two parts - the package reference for the building of the apps and a project reference for the type script compiler. First the package.json files of each app - add `"@blenheim/model": "0.0.1"` to the dependencies.
- The the project reference in tsconfig.json files of each app - add the following to each file after the compiler options

```json
"references": [
    {
      "path": "../blenheim-model/tsconfig.json"
    }
  ]
```

See [Typescript project references](https://www.typescriptlang.org/docs/handbook/project-references.html)

## Things To Note
The automatic insertion of imports uses an absolute path - starting at `src/`. This falls over in Jest testing - better to use relative paths.

## Angular Configs

Before running the next step run `npm install` in the root folder to install the dependencies for the root package.json. Otherwise there will be more than one node-modules folder for the workspace.

Run `ng add @angular/material` to add the material library

# Naming Convention

Use the common practice to match what would be expected in Angular code
* '_' prefix for private variables and members
* '$' suffix for observable variables

## Don't Need OnInit For Observables and Viewmodels (or Constructors)

This is based on [this article](https://indepth.dev/posts/1508/structure-initialization-logic-without-ngoninit-utilize-observables-and-ngonchanges).
For observables, we don't need to wait for the OnInit hook, we can initialise the observable straight away. Also means the observable does not have to be nullable.

Use observable viewmodels to transfer data to the page - standard name `vm$`. Also define the type of the viewmodel. Will save a lot of time not having to trace back what it is. For example:

Also note we now explicitly inject the service without a constructor.

```typescript
export class DestinationsPageComponent {
  private _flightService = inject(FlightService);

  vm$: Observable<{ code: string; name: string; fluff: string }[]> =
    this._flightService.getOrigins$().pipe(
      map(o => {
        const sorted = o.sort((a, b) => cityName(a).localeCompare(cityName(b)));
        return sorted.map(o => ({ code: o, name: cityName(o), fluff: originFluff(o) }));
      })
    );
}
```

# NestJS

Delete the default app.controller.ts and app.service.ts files. Remove the references in app.module.ts.

Use the CLI to create the controllers and services. For example `nest g controller flight` and `nest g service flight`

In the root create a `settings.env` file containg
```
CLIENT_DIST=../../blenheim-client/dist/blenheim-client
JWT_SECRET=THIS IS A HIGHLY SECRET KEY THAT SHOULD BE CHANGED
```

 We need this so in dev mode we point at the client project dist folder and in production mode we will copy the client dist folder to folder within the server dist folder. The `.env` file will be overwritten as part of the production build process. Add .env to a local .gitignore file so it is not added to source control
