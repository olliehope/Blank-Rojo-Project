# Weapon-RNG

A Roblox project using Rojo, Aftman, Wally, and npm scripts.

## Terminal Commands

Run these once after cloning:

```powershell
npm install
aftman install
npm run wally:install
```

Use these while working:

```powershell
npm run serve       # generate default.project.json and start Rojo
npm run watch:rojo  # regenerate default.project.json when src changes
npm run check       # run project generation, style check, and sourcemap
npm run format      # format Luau files
npm run build       # build place.rbxlx
```

Use this if you rename the project:

```powershell
npm run init -- "My Game Name"
```

## Commit Prefixes

```text
feat      new feature or gameplay system
fix       bug fix
balance   gameplay values, drop rates, damage, prices, timing
ui        menus, buttons, HUD, visual flow
data      config, loot tables, weapon stats, saved data shape
tool      scripts, Rojo generation, build helpers
docs      README or project notes
chore     dependency, package, or cleanup work
refactor  code restructure without changing behavior
```