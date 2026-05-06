local MainScreen = require(script.Screens.MainScreen)

local function App(vide)
	local create = vide.create

	return create("ScreenGui")({
		Name = "App",
		IgnoreGuiInset = true,
		ResetOnSpawn = false,

		MainScreen(vide),
	})
end

return App
