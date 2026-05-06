local ReplicatedStorage = game:GetService("ReplicatedStorage")

local Services = ReplicatedStorage:WaitForChild("Services")
local ExampleServiceUtils = require(Services.ExampleService.ExampleServiceUtils)

local ExampleServiceServer = {
	Name = "ExampleServiceServer",
}

function ExampleServiceServer.start()
	print(string.format("[%s] %s", ExampleServiceServer.Name, ExampleServiceUtils.message("server")))
end

return ExampleServiceServer
