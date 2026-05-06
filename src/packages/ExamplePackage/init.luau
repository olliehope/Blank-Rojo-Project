local ExamplePackage = {}

function ExamplePackage.message()
	return "Hello from a custom package."
end

return table.freeze(ExamplePackage)
