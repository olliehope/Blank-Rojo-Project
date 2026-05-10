# Blank-Rojo-Project

A simple Rojo/Aftman/Wally setup for Blank-Rojo-Project.

## New Project

```powershell
npm install
npm run init -- My Project Name
aftman install
npm run wally:install
npm run serve
```

`npm run init` updates the npm package name, Wally package name, README title, and generated Rojo project name.

## Terminal Commands

First-time setup after cloning this template:

```powershell
npm install
npm run init -- "My Game Name"
aftman install
npm run wally:install
npm run serve
```

Daily development:

```powershell
npm run serve       # generate default.project.json and start Rojo
npm run watch:rojo  # regenerate default.project.json while editing src
npm run check       # regenerate feature tree, check Stylua, update sourcemap
npm run format      # format Luau files
npm run build       # build place.rbxlx
```

Tooling:

```powershell
aftman install      # install tools pinned in aftman.toml
aftman list         # show installed Aftman tools
npm run wally:install # install Wally packages and generate package types
npm run sourcemap   # regenerate sourcemap.json
```

Project scripts:

```powershell
npm run init -- My Project Name # rename this clone
npm run build:rojo             # regenerate default.project.json
npm run serve                  # generate + start rojo serve
npm run build                  # build place.rbxlx
npm run check                  # feature tree + stylua check + sourcemap
npm run format                 # format Luau files
npm run wally:install          # install Wally packages and generate package types
```

This template uses Aftman as its only toolchain manager. Keep `%USERPROFILE%\.aftman\bin` on your user `PATH` so commands like `rojo`, `wally`, and `stylua` use this project's `aftman.toml`.

## Layout

```text
src/
  startup/   # Client, server, and MountUI boot files
  features/  # feature modules split by Client, Server, Utils, or Types
  core/      # shared foundation modules
  game/      # shared game configuration/content modules
```

`tools/genFeatureTree.js` generates `default.project.json`, maps source files under `ReplicatedStorage.Source`, keeps server files under `ServerScriptService`, and mounts root `Packages`.

## Feature Shape

```text
src/features/ExampleFeature/
  Client.luau  # ReplicatedStorage.Source.Features.ExampleFeature.ExampleFeatureClient
  Server.luau  # ServerScriptService.Features.ExampleFeature.ExampleFeatureServer
  Utils.luau   # ReplicatedStorage.Source.Features.ExampleFeature.ExampleFeatureUtils
```
