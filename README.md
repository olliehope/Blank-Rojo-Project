# Blank-Rojo-Project

A simple Rojo/Rokit/Wally setup for Blank-Rojo-Project.

## New Project

After cloning this template, rename the starter files with:

```bash
npm run init -- My Project Name
```

This updates the npm package name, Wally package name, README title, example UI title, and generated Rojo project name.

## Setup

```bash
npm install
rokit install
wally install
npm run build:rojo
rojo serve default.project.json
```

If PowerShell blocks `npm`, use `npm.cmd` with the same script name.

## Commands

```bash
npm run init -- My Project Name # rename this clone for a new project
npm run build:rojo             # regenerate default.project.json
npm run sourcemap              # regenerate sourcemap.json
npm run serve                  # generate + start rojo serve
npm run build                  # build place.rbxlx
npm run check                  # regenerate, format-check, and sourcemap-check
npm run format                 # format Luau files
```

## Source Layout

```text
src/
  startup/            # boot scripts mounted directly into Roblox services
  packages/           # custom packages merged into ReplicatedStorage.Packages
  services/           # split client/server/utils service modules
  ui/                 # Vide UI modules/components
```

Generated Roblox tree after `wally install` and `npm run build:rojo`:

```text
ReplicatedStorage
  Packages
    ExamplePackage
    vide
  Services
    ExampleService
      ExampleServiceClient
      ExampleServiceUtils

ServerScriptService
  Server
  Services
    ExampleService
      ExampleServiceServer

StarterPlayer
  StarterPlayerScripts
    Client
    UI
```

## Services

Services use this folder shape:

```text
src/services/ExampleService/
  Client/init.luau  # ReplicatedStorage.Services.ExampleService.ExampleServiceClient
  Server/init.luau  # ServerScriptService.Services.ExampleService.ExampleServiceServer
  Utils/init.luau   # ReplicatedStorage.Services.ExampleService.ExampleServiceUtils
```

`Server` stays private in `ServerScriptService`. `Client` and `Utils` are replicated so both sides can require them.

## Packages

Wally installs generated packages into the root `Packages` folder. The folder is tracked with a `.gitkeep`, but generated package contents are ignored.

Custom packages live in `src/packages` and are merged into the same Roblox folder:

```text
ReplicatedStorage.Packages
  ExamplePackage  # from src/packages
  vide            # from Wally after wally install
```

Package names must be unique across Wally and custom packages.

## UI

UI uses Vide through Wally. Run `wally install` before serving so `ReplicatedStorage.Packages.vide` exists in Studio.

```text
src/ui/
  App.luau
  Renderer.luau
  components/
  screens/
  theme/
```

The Rojo project file is generated from `tools/genRojoTree.js`.
