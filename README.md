# Blank-Rojo-Project

A small Rojo/Rokit/Wally starter for Roblox projects.

## New Project

```bash
npm install
npm run init -- My Project Name
rokit install
wally install
npm run serve
```

`npm run init` updates the npm package name, Wally package name, README title, and generated Rojo project name.

## Commands

```bash
npm run init -- My Project Name # rename this clone
npm run build:rojo             # regenerate default.project.json
npm run serve                  # generate + start rojo serve
npm run build                  # build place.rbxlx
npm run check                  # rojo tree + stylua check + sourcemap
npm run format                 # format Luau files
```

## Layout

```text
src/
  startup/   # Client.client.luau and Server.server.luau boot scripts
  packages/  # custom packages merged with Wally packages
  services/  # Client/Server/Utils service folders
  ui/        # Vide UI modules
```

`tools/genRojoTree.js` generates `default.project.json`, merges root `Packages` with `src/packages`, and maps services into the right Roblox containers.

## Service Shape

```text
src/services/ExampleService/
  Client/init.luau  # ReplicatedStorage.Services.ExampleService.ExampleServiceClient
  Server/init.luau  # ServerScriptService.Services.ExampleService.ExampleServiceServer
  Utils/init.luau   # ReplicatedStorage.Services.ExampleService.ExampleServiceUtils
```