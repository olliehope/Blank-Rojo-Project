const fs = require("fs");
const path = require("path");

const ROOT_PATH = path.resolve(__dirname, "..");
const BASE_PATH = path.join(ROOT_PATH, "src");
const OUTPUT_PATH = path.join(ROOT_PATH, "default.project.json");
const PACKAGES_PATH = path.join(ROOT_PATH, "Packages");
const STARTUP_PATH = path.join(BASE_PATH, "startup");

function toPosix(filePath) {
	return filePath.split(path.sep).join("/");
}

const BLACKLISTED_DIRS = new Set([toPosix(STARTUP_PATH)]);

function exists(filePath) {
	return fs.existsSync(filePath);
}

function readJson(filePath) {
	return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function readProjectName() {
	const packageJsonPath = path.join(ROOT_PATH, "package.json");

	if (!exists(packageJsonPath)) {
		return "Blank-Rojo-Project";
	}

	const packageJson = readJson(packageJsonPath);

	return packageJson.projectName || packageJson.name || "Blank-Rojo-Project";
}

function relativeToRoot(filePath) {
	return toPosix(path.relative(ROOT_PATH, filePath));
}

function toPascalCase(value) {
	if (value.toLowerCase() === "ui") {
		return "UI";
	}

	return value
		.split(/[\s_-]+/)
		.filter(Boolean)
		.map((part) => part.charAt(0).toUpperCase() + part.slice(1))
		.join("");
}

function stripScriptSuffix(name) {
	return name.replace(/\.(server|client)$/i, "");
}

function isScriptFile(filePath) {
	return [".lua", ".luau"].includes(path.extname(filePath).toLowerCase());
}

function isInitScript(entry) {
	if (!entry.isFile() || !isScriptFile(entry.name)) {
		return false;
	}

	const baseName = stripScriptSuffix(path.basename(entry.name, path.extname(entry.name)));

	return baseName.toLowerCase() === "init";
}

function getRunContext(rawName, parts) {
	const lowerName = rawName.toLowerCase();
	const logicalName = stripScriptSuffix(rawName).toLowerCase();
	const lowerParts = parts.map((part) => part.toLowerCase());

	if (lowerName.endsWith(".server") || logicalName === "server" || lowerParts.includes("server")) {
		return "Server";
	}

	return "Client";
}

function getVirtualPath(filePath) {
	const relativePath = path.relative(BASE_PATH, filePath);
	const parts = relativePath.split(path.sep);
	const rawName = path.basename(filePath, path.extname(filePath));
	const filename = stripScriptSuffix(rawName);
	const lowerFilename = filename.toLowerCase();
	const folder = parts.slice(0, -1).map(toPascalCase);
	const folderName = folder.length > 0 ? folder[folder.length - 1] : "";
	const runContext = getRunContext(rawName, parts);
	const isInit = lowerFilename === "init";
	let name;

	if (isInit) {
		name = folderName;
	} else if (["server", "client", "utils", "types"].includes(lowerFilename)) {
		name = folderName + toPascalCase(filename);
	} else {
		name = toPascalCase(filename);
	}

	return {
		isInit,
		target: runContext === "Server" ? "ServerScriptService" : "ReplicatedStorage",
		folder,
		name,
		file: isInit
			? relativeToRoot(path.join(BASE_PATH, ...parts.slice(0, -1)))
			: relativeToRoot(filePath),
	};
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

function addIfExists(parent, name, filePath) {
	if (exists(filePath)) {
		parent[name] = { $path: relativeToRoot(filePath) };
	}
}

function walk(dir, callback) {
	if (!exists(dir) || BLACKLISTED_DIRS.has(toPosix(dir))) {
		return;
	}

	const entries = fs
		.readdirSync(dir, { withFileTypes: true })
		.sort((left, right) => left.name.localeCompare(right.name));
	const initEntry = entries.find(isInitScript);

	if (initEntry) {
		callback(path.join(dir, initEntry.name));
		return;
	}

	for (const entry of entries) {
		const fullPath = path.join(dir, entry.name);

		if (entry.isDirectory()) {
			walk(fullPath, callback);
		} else if (entry.isFile() && isScriptFile(entry.name)) {
			callback(fullPath);
		}
	}
}

const tree = {
	emitLegacyScripts: false,
	name: readProjectName(),
	tree: {
		$className: "DataModel",

		ReplicatedStorage: {
			Source: {
				$className: "Folder",
				Features: { $className: "Folder" },
				Core: { $className: "Folder" },
				Game: { $className: "Folder" },
				StartUp: {
					$className: "Folder",
				},
			},
			Packages: { $path: relativeToRoot(PACKAGES_PATH) },
		},

		ServerScriptService: {
			Features: { $className: "Folder" },
			Core: { $className: "Folder" },
			Game: { $className: "Folder" },
			StartUp: {
				$className: "Folder",
			},
		},
	},
};

const sharedRoot = tree.tree.ReplicatedStorage.Source;
const serverRoot = tree.tree.ServerScriptService;

addIfExists(sharedRoot.StartUp, "MountUI", path.join(STARTUP_PATH, "MountUI.luau"));
addIfExists(sharedRoot.StartUp, "Client", path.join(STARTUP_PATH, "Client.client.luau"));
addIfExists(serverRoot.StartUp, "Server", path.join(STARTUP_PATH, "Server.server.luau"));

walk(BASE_PATH, (filePath) => {
	const { target, folder, name, file, isInit } = getVirtualPath(filePath);
	const root = target === "ServerScriptService" ? serverRoot : sharedRoot;

	if (!name) {
		return;
	}

	if (isInit) {
		const parent = ensurePath(root, folder.slice(0, -1));
		parent[name] = { $path: file };
		return;
	}

	const current = ensurePath(root, folder);
	current[name] = { $path: file };
});

fs.writeFileSync(OUTPUT_PATH, `${JSON.stringify(tree, null, 2)}\n`);
console.log("default.project.json generated.");
