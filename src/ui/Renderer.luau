local ReplicatedStorage = game:GetService("ReplicatedStorage")

local Packages = ReplicatedStorage:WaitForChild("Packages")
local Vide = require(Packages.vide)

local Renderer = {}

function Renderer.mount(component, parent)
	return Vide.mount(function()
		return component(Vide)
	end, parent)
end

return Renderer
