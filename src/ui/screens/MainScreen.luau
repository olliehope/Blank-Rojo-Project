local PrimaryButton = require(script.Parent.Parent.Components.PrimaryButton)
local Theme = require(script.Parent.Parent.Theme.Theme)

local function MainScreen(vide)
	local create = vide.create
	local source = vide.source
	local clicks = source(0)

	return create("Frame")({
		Name = "MainScreen",
		AnchorPoint = Vector2.new(0.5, 0.5),
		BackgroundTransparency = 1,
		Position = UDim2.fromScale(0.5, 0.5),
		Size = UDim2.fromOffset(320, 160),

		create("TextLabel")({
			Name = "Title",
			BackgroundTransparency = 1,
			Font = Theme.Fonts.Bold,
			Position = UDim2.fromOffset(0, 0),
			Size = UDim2.new(1, 0, 0, 48),
			Text = "testttttttttttt",
			TextColor3 = Theme.Colors.Text,
			TextSize = 28,
		}),

		PrimaryButton(vide, {
			position = UDim2.fromScale(0.5, 0.75),
			text = function()
				return string.format("Clicked %d", clicks())
			end,
			activated = function()
				clicks(clicks() + 1)
			end,
		}),
	})
end

return MainScreen
