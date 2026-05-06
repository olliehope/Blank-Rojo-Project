local Theme = require(script.Parent.Parent.Theme.Theme)

local function PrimaryButton(vide, props)
	local create = vide.create

	return create("TextButton")({
		Name = props.name or "PrimaryButton",
		AnchorPoint = Vector2.new(0.5, 0.5),
		Position = props.position or UDim2.fromScale(0.5, 0.5),
		Size = props.size or UDim2.fromOffset(180, 44),
		BackgroundColor3 = Theme.Colors.Primary,
		BorderSizePixel = 0,
		Font = Theme.Fonts.Medium,
		Text = props.text or "Button",
		TextColor3 = Theme.Colors.TextOnPrimary,
		TextSize = 16,
		Activated = props.activated or function() end,

		create("UICorner")({
			CornerRadius = UDim.new(0, 8),
		}),
	})
end

return PrimaryButton
