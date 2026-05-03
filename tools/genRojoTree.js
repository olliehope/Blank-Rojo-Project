const fs = require("fs");
const path = require("path");

const ROOT_PATH = path.resolve(__dirname, "..");
const SRC_PATH = path.join(ROOT_PATH, "src");
const CLIENT_PATH = path.join(SRC_PATH, "client");
const SHARED_PATH = path.join(SRC_PATH, "shared");
const SERVER_PATH = path.join(SRC_PATH, "server");
const STARTUP_PATH = path.join(SRC_PATH, "startup");
const OUTPUT_PATH = path.join(ROOT_PATH, "default.project.json");

const STARTUP_SERVER_PATH = path.join(STARTUP_PATH, "Server.server.luau");
const STARTUP_CLIENT_PATH = path.join(STARTUP_PATH, "Client.client.luau");
const PACKAGES_PATH = path.join(ROOT_PATH, "Packages");

const initClaimedFolders = new Set();

const CLIENT_FOLDERS = [
	"Components",
	"Controllers",
	"Effects",
	"UI",
	"Utils",
];

const SHARED_FOLDERS = [
	"Classes",
	"Components",
	"Config",
	"Constants",
	"Libraries",
	"Modules",
	"Network",
	"Services",
	"Types",
	"Utils",
];

const SERVER_FOLDERS = [
	"Classes",
	"Commands",
	"Config",
	"Data",
	"Modules",
	"Services",
	"Systems",
	"Utils",
];

const ASSET_FOLDERS = [
	"Animations",
	"Audio",
	"Effects",
	"Images",
	"Maps",
	"Models",
	"Tools",
	"Weapons",
];

const UI_FOLDERS = [
	"Components",
	"Huds",
	"Menus",
	"Screens",
	"Theme",
	"Widgets",
];

const SERVER_STORAGE_FOLDERS = [
	"Maps",
	"NPCs",
	"Templates",
];

const WORKSPACE_FOLDERS = [
	"Ignore",
	"Lobby",
	"Map",
	"Spawns",
];

function toPosix(filePath) {
	return filePath.split(path.sep).join("/");
}

function relativeToRoot(filePath) {
	return toPosix(path.relative(ROOT_PATH, filePath));
}

function exists(filePath) {
	return fs.existsSync(filePath);
}

function toPascalCase(value) {
	return value
		.split(/[\s_-]+/)
		.filter(Boolean)
		.map((part) => part.charAt(0).toUpperCase() + part.slice(1))
		.join("");
}

function readProjectName() {
	const packageJsonPath = path.join(ROOT_PATH, "package.json");

	if (!exists(packageJsonPath)) {
		return "murdermystery";
	}

	const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
	return packageJson.name || "murdermystery";
}

function createFolders(names) {
	return Object.fromEntries(names.map((name) => [name, { $className: "Folder" }]));
}

function stripScriptSuffix(filename) {
	return filename.replace(/\.(server|client)$/i, "");
}

function isServerScriptName(filename) {
	const normalized = stripScriptSuffix(filename).toLowerCase();

	return (
		filename.toLowerCase().endsWith(".server") ||
		normalized === "server" ||
		normalized.endsWith("server")
	);
}

function getVirtualPath(sourceRoot, filepath) {
	const relativePath = path.relative(sourceRoot, filepath);
	const parts = relativePath.split(path.sep);
	const rawFilename = path.basename(filepath, path.extname(filepath));
	const filename = stripScriptSuffix(rawFilename);
	const lowerFilename = filename.toLowerCase();
	const folderParts = parts.slice(0, -1).map(toPascalCase);
	const folderName = folderParts.length > 0 ? folderParts[folderParts.length - 1] : "";

	let name;
	if (lowerFilename === "init") {
		name = folderName;
	} else if (["server", "client", "utils", "types"].includes(lowerFilename)) {
		name = folderName + toPascalCase(filename);
	} else {
		name = toPascalCase(filename);
	}

	return {
		isInit: lowerFilename === "init",
		isServer: isServerScriptName(rawFilename),
		folder: folderParts,
		name,
		file: lowerFilename === "init"
			? relativeToRoot(path.join(sourceRoot, ...parts.slice(0, -1)))
			: relativeToRoot(filepath),
	};
}

function folderKey(rootName, folder) {
	return `${rootName}/${folder.join("/")}`.toLowerCase();
}

function isClaimedByInit(rootName, folder) {
	for (let index = 1; index <= folder.length; index += 1) {
		if (initClaimedFolders.has(folderKey(rootName, folder.slice(0, index)))) {
			return true;
		}
	}

	return false;
}

function collectScriptFiles(dir, files = []) {
	if (!exists(dir)) {
		return files;
	}

	for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
		const fullPath = path.join(dir, entry.name);

		if (entry.isDirectory()) {
			collectScriptFiles(fullPath, files);
		} else if (entry.isFile() && [".lua", ".luau"].includes(path.extname(entry.name))) {
			files.push(fullPath);
		}
	}

	return files;
}

function sortFilesForInitClaims(files) {
	return files.sort((left, right) => {
		const leftIsInit = stripScriptSuffix(path.basename(left, path.extname(left))).toLowerCase() === "init";
		const rightIsInit = stripScriptSuffix(path.basename(right, path.extname(right))).toLowerCase() === "init";

		if (leftIsInit !== rightIsInit) {
			return leftIsInit ? -1 : 1;
		}

		return relativeToRoot(left).localeCompare(relativeToRoot(right));
	});
}

function getOrCreateFolder(root, folder) {
	let current = root;

	for (const part of folder) {
		if (!current[part]) {
			current[part] = { $className: "Folder" };
		}

		current = current[part];
	}

	return current;
}

const tree = {
	name: readProjectName(),
	tree: {
		$className: "DataModel",
		Workspace: createFolders(WORKSPACE_FOLDERS),
		ReplicatedStorage: {
			Shared: {
				$className: "Folder",
				...createFolders(SHARED_FOLDERS),
			},
			Assets: {
				$className: "Folder",
				...createFolders(ASSET_FOLDERS),
			},
		},
		ServerScriptService: {
			...createFolders(SERVER_FOLDERS),
		},
		ServerStorage: {
			...createFolders(SERVER_STORAGE_FOLDERS),
		},
		StarterPlayer: {
			StarterPlayerScripts: {
				...createFolders(CLIENT_FOLDERS),
				UI: {
					$className: "Folder",
					...createFolders(UI_FOLDERS),
				},
			},
		},
	},
};

if (exists(PACKAGES_PATH)) {
	tree.tree.ReplicatedStorage.Packages = { $path: relativeToRoot(PACKAGES_PATH) };
}

if (exists(STARTUP_SERVER_PATH)) {
	tree.tree.ServerScriptService.Server = { $path: relativeToRoot(STARTUP_SERVER_PATH) };
}

if (exists(STARTUP_CLIENT_PATH)) {
	tree.tree.StarterPlayer.StarterPlayerScripts.Client = { $path: relativeToRoot(STARTUP_CLIENT_PATH) };
}

const clientRoot = tree.tree.StarterPlayer.StarterPlayerScripts;
const sharedRoot = tree.tree.ReplicatedStorage.Shared;
const serverRoot = tree.tree.ServerScriptService;

function addFileToTree(rootName, root, sourceRoot, filepath) {
	const { isInit, isServer, folder, name, file } = getVirtualPath(sourceRoot, filepath);
	const targetRootName = isServer ? "server" : rootName;
	const targetRoot = isServer ? serverRoot : root;

	if (isClaimedByInit(targetRootName, folder)) {
		return;
	}

	if (isInit) {
		const parent = getOrCreateFolder(targetRoot, folder.slice(0, -1));
		parent[name] = { $path: file };
		initClaimedFolders.add(folderKey(targetRootName, folder));
		return;
	}

	const current = getOrCreateFolder(targetRoot, folder);
	current[name] = { $path: file };
}

for (const filepath of sortFilesForInitClaims(collectScriptFiles(CLIENT_PATH))) {
	addFileToTree("client", clientRoot, CLIENT_PATH, filepath);
}

for (const filepath of sortFilesForInitClaims(collectScriptFiles(SHARED_PATH))) {
	addFileToTree("shared", sharedRoot, SHARED_PATH, filepath);
}

for (const filepath of sortFilesForInitClaims(collectScriptFiles(SERVER_PATH))) {
	addFileToTree("server", serverRoot, SERVER_PATH, filepath);
}

fs.writeFileSync(OUTPUT_PATH, JSON.stringify(tree, null, 2) + "\n");
console.log("default.project.json generated.");
