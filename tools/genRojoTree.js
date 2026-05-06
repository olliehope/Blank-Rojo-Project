const fs = require("fs");
const path = require("path");

const ROOT_PATH = path.resolve(__dirname, "..");
const SRC_PATH = path.join(ROOT_PATH, "src");
const OUTPUT_PATH = path.join(ROOT_PATH, "default.project.json");
const PACKAGES_PATH = path.join(ROOT_PATH, "Packages");
const STARTUP_PATH = path.join(SRC_PATH, "startup");
const STARTUP_CLIENT_PATH = path.join(STARTUP_PATH, "Client.client.luau");
const STARTUP_SERVER_PATH = path.join(STARTUP_PATH, "Server.server.luau");

const SOURCE_ROOTS = {
	client: path.join(SRC_PATH, "client"),
	packages: path.join(SRC_PATH, "packages"),
	server: path.join(SRC_PATH, "server"),
	services: path.join(SRC_PATH, "services"),
	shared: path.join(SRC_PATH, "shared"),
	ui: path.join(SRC_PATH, "ui"),
};

function exists(filePath) {
	return fs.existsSync(filePath);
}

function toPosix(filePath) {
	return filePath.split(path.sep).join("/");
}

function relativeToRoot(filePath) {
	return toPosix(path.relative(ROOT_PATH, filePath));
}

function readJson(filePath) {
	return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function readProjectName() {
	const packageJsonPath = path.join(ROOT_PATH, "package.json");

	if (!exists(packageJsonPath)) {
		return "roblox-template";
	}

	return readJson(packageJsonPath).name || "roblox-template";
}

function pathMapping(filePath) {
	return { $path: relativeToRoot(filePath) };
}

function stripScriptSuffix(name) {
	return name.replace(/\.(server|client)$/i, "");
}

function toPascalCase(value) {
	return value
		.split(/[\s_-]+/)
		.filter(Boolean)
		.map((part) => part.charAt(0).toUpperCase() + part.slice(1))
		.join("");
}

function toInstanceName(value) {
	if (value.toLowerCase() === "ui") {
		return "UI";
	}

	return toPascalCase(value);
}

function isScriptFile(filePath) {
	return [".lua", ".luau"].includes(path.extname(filePath).toLowerCase());
}

function buildScriptTree(dir) {
	if (!exists(dir)) {
		return undefined;
	}

	const entries = fs
		.readdirSync(dir, { withFileTypes: true })
		.sort((left, right) => left.name.localeCompare(right.name));
	const initFile = entries.find((entry) => {
		if (!entry.isFile()) {
			return false;
		}

		const baseName = stripScriptSuffix(path.basename(entry.name, path.extname(entry.name))).toLowerCase();
		return baseName === "init" && isScriptFile(entry.name);
	});

	if (initFile) {
		return pathMapping(dir);
	}

	const node = { $className: "Folder" };

	for (const entry of entries) {
		const fullPath = path.join(dir, entry.name);

		if (entry.isDirectory()) {
			const childNode = buildScriptTree(fullPath);

			if (childNode) {
				node[toInstanceName(entry.name)] = childNode;
			}
		} else if (entry.isFile() && isScriptFile(entry.name)) {
			const name = stripScriptSuffix(path.basename(entry.name, path.extname(entry.name)));
			node[toInstanceName(name)] = pathMapping(fullPath);
		}
	}

	return Object.keys(node).length > 1 ? node : undefined;
}

function scriptTreeOrFolder(dir) {
	return buildScriptTree(dir) || { $className: "Folder" };
}

function serviceChildrenFromDir(dir) {
	const scriptTree = buildScriptTree(dir);

	if (!scriptTree) {
		return {};
	}

	const { $className, ...children } = scriptTree;

	return children;
}

function ensurePath(root, parts) {
	let current = root;

	for (const part of parts) {
		if (!current[part]) {
			current[part] = { $className: "Folder" };
		}

		current = current[part];
	}

	return current;
}

function listDirectories(dir) {
	if (!exists(dir)) {
		return [];
	}

	return fs
		.readdirSync(dir, { withFileTypes: true })
		.filter((entry) => entry.isDirectory())
		.map((entry) => entry.name)
		.sort((left, right) => left.localeCompare(right));
}

function addIfExists(parent, name, filePath) {
	if (exists(filePath)) {
		parent[name] = pathMapping(filePath);
	}
}

function isDirectoryEntry(entry, fullPath) {
	if (entry.isDirectory()) {
		return true;
	}

	if (!entry.isSymbolicLink()) {
		return false;
	}

	return fs.statSync(fullPath).isDirectory();
}

function addPackageChildren(target, dir, sourceName) {
	if (!exists(dir)) {
		return;
	}

	const entries = fs
		.readdirSync(dir, { withFileTypes: true })
		.sort((left, right) => left.name.localeCompare(right.name));

	for (const entry of entries) {
		if (entry.name === ".gitkeep") {
			continue;
		}

		const fullPath = path.join(dir, entry.name);
		let instanceName;

		if (isDirectoryEntry(entry, fullPath)) {
			instanceName = entry.name;
		} else if (entry.isFile() && isScriptFile(entry.name)) {
			instanceName = stripScriptSuffix(path.basename(entry.name, path.extname(entry.name)));
		} else {
			continue;
		}

		if (target[instanceName]) {
			throw new Error(`Package name collision for "${instanceName}" while adding ${sourceName}.`);
		}

		target[instanceName] = pathMapping(fullPath);
	}
}

function addPackageMappings(project) {
	const packagesTarget = ensurePath(project.tree.ReplicatedStorage, ["Packages"]);

	addPackageChildren(packagesTarget, PACKAGES_PATH, "Wally packages");
	addPackageChildren(packagesTarget, SOURCE_ROOTS.packages, "custom packages");
}

function addServiceMappings(project) {
	for (const serviceName of listDirectories(SOURCE_ROOTS.services)) {
		const servicePath = path.join(SOURCE_ROOTS.services, serviceName);
		const instanceName = toInstanceName(serviceName);
		const replicatedTarget = ensurePath(project.tree.ReplicatedStorage, ["Services", instanceName]);
		const serverTarget = ensurePath(project.tree.ServerScriptService.Services, [instanceName]);

		const clientTree = buildScriptTree(path.join(servicePath, "Client"));
		const serverTree = buildScriptTree(path.join(servicePath, "Server"));
		const utilsTree = buildScriptTree(path.join(servicePath, "Utils"));

		// Client and Utils are replicated so both client and server code can require them.
		if (clientTree) {
			replicatedTarget[`${instanceName}Client`] = clientTree;
		}

		if (utilsTree) {
			replicatedTarget[`${instanceName}Utils`] = utilsTree;
		}

		// Server stays private in ServerScriptService.
		if (serverTree) {
			serverTarget[`${instanceName}Server`] = serverTree;
		}
	}
}

const project = {
	name: readProjectName(),
	tree: {
		$className: "DataModel",
		ReplicatedStorage: serviceChildrenFromDir(SOURCE_ROOTS.shared),
		ServerScriptService: serviceChildrenFromDir(SOURCE_ROOTS.server),
		StarterPlayer: {
			StarterPlayerScripts: serviceChildrenFromDir(SOURCE_ROOTS.client),
		},
	},
};

project.tree.ServerScriptService.Services = { $className: "Folder" };
project.tree.StarterPlayer.StarterPlayerScripts.UI = scriptTreeOrFolder(SOURCE_ROOTS.ui);
addIfExists(project.tree.ServerScriptService, "Server", STARTUP_SERVER_PATH);
addIfExists(project.tree.StarterPlayer.StarterPlayerScripts, "Client", STARTUP_CLIENT_PATH);
addServiceMappings(project);
addPackageMappings(project);

fs.writeFileSync(OUTPUT_PATH, `${JSON.stringify(project, null, 2)}\n`);
console.log("default.project.json generated.");
