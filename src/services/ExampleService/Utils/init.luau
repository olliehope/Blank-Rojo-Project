local ExampleServiceUtils = {}

function ExampleServiceUtils.message(context)
	return string.format("Example service is running on the %s.", context)
end

return table.freeze(ExampleServiceUtils)
