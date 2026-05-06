local Players = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")

local App = require(script.Parent.UI.App)
local Renderer = require(script.Parent.UI.Renderer)

local Packages = ReplicatedStorage:WaitForChild("Packages")
local Services = ReplicatedStorage:WaitForChild("Services")
local ExamplePackage = require(Packages.ExamplePackage)
local ExampleServiceClient = require(Services.ExampleService.ExampleServiceClient)
local playerGui = Players.LocalPlayer:WaitForChild("PlayerGui")

print(ExamplePackage.message())
ExampleServiceClient.start()

local destroyApp = Renderer.mount(App, playerGui)

script.Destroying:Connect(destroyApp)
