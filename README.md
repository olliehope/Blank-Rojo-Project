# Blank-Rojo-Project

A small Rojo/Aftman/Wally starter for Roblox projects.

## New Project

```powershell
npm install
npm run init -- My Project Name
aftman install
wally install
npm run serve
```

`npm run init` updates the npm package name, Wally package name, README title, and generated Rojo project name.

## Terminal Commands

First-time setup after cloning this template:

```powershell
npm install
npm run init -- "My Game Name"
aftman install
wally install
npm run serve
```

Daily development:

```powershell
npm run serve       # generate default.project.json and start Rojo
npm run watch:rojo  # regenerate default.project.json while editing src
npm run check       # regenerate Rojo tree, check Stylua, update sourcemap
npm run format      # format Luau files
npm run build       # build place.rbxlx
```

Tooling:

```powershell
aftman install      # install tools pinned in aftman.toml
aftman list         # show installed Aftman tools
wally install       # install packages from wally.toml
npm run sourcemap   # regenerate sourcemap.json
```

Project scripts:

```powershell
npm run init -- My Project Name # rename this clone
npm run build:rojo             # regenerate default.project.json
npm run serve                  # generate + start rojo serve
npm run build                  # build place.rbxlx
npm run check                  # rojo tree + stylua check + sourcemap
npm run format                 # format Luau files
```

This template uses Aftman as its only toolchain manager. Keep `%USERPROFILE%\.aftman\bin` on your user `PATH` so commands like `rojo`, `wally`, and `stylua` use this project's `aftman.toml`.

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
