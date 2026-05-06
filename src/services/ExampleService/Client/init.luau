local ReplicatedStorage = game:GetService("ReplicatedStorage")

local Services = ReplicatedStorage:WaitForChild("Services")
local ExampleServiceUtils = require(Services.ExampleService.ExampleServiceUtils)

local ExampleServiceClient = {
	Name = "ExampleServiceClient",
}

function ExampleServiceClient.start()
	print(string.format("[%s] %s", ExampleServiceClient.Name, ExampleServiceUtils.message("client")))
end

return ExampleServiceClient
