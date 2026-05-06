const fs = require("fs");
const path = require("path");

const ROOT_PATH = path.resolve(__dirname, "..");

function exists(filePath) {
	return fs.existsSync(filePath);
}

function readText(relativePath) {
	return fs.readFileSync(path.join(ROOT_PATH, relativePath), "utf8");
}

function writeText(relativePath, content) {
	fs.writeFileSync(path.join(ROOT_PATH, relativePath), content);
}

function readJson(relativePath) {
	return JSON.parse(readText(relativePath));
}

function writeJson(relativePath, value) {
	writeText(relativePath, `${JSON.stringify(value, null, 2)}\n`);
}

function toPackageId(displayName) {
	const packageId = displayName
		.trim()
		.toLowerCase()
		.replace(/['"]/g, "")
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-+|-+$/g, "");

	if (!packageId) {
		throw new Error("Project name must contain at least one letter or number.");
	}

	return packageId;
}

function replaceText(relativePath, replacer) {
	const filePath = path.join(ROOT_PATH, relativePath);

	if (!exists(filePath)) {
		return;
	}

	writeText(relativePath, replacer(readText(relativePath)));
}

function updatePackageJson(displayName, packageId) {
	const packageJson = readJson("package.json");

	packageJson.name = packageId;
	packageJson.projectName = displayName;
	packageJson.description = `${displayName} Roblox project setup.`;

	writeJson("package.json", packageJson);
}

function updatePackageLock(packageId) {
	const lockPath = path.join(ROOT_PATH, "package-lock.json");

	if (!exists(lockPath)) {
		return;
	}

	const packageLock = readJson("package-lock.json");

	packageLock.name = packageId;

	if (packageLock.packages && packageLock.packages[""]) {
		packageLock.packages[""].name = packageId;
	}

	writeJson("package-lock.json", packageLock);
}

function updateWallyFiles(packageId) {
	replaceText("wally.toml", (content) => content.replace(/^name\s*=\s*"desktop\/[^"]+"/m, `name = "desktop/${packageId}"`));
	replaceText("wally.lock", (content) => content.replace(/name\s*=\s*"desktop\/[^"]+"/, `name = "desktop/${packageId}"`));
}

function updateReadme(displayName) {
	replaceText("README.md", (content) => {
		const lines = content.split(/\r?\n/);

		if (lines.length > 0 && lines[0].startsWith("# ")) {
			lines[0] = `# ${displayName}`;
		}

		for (let index = 1; index < lines.length; index += 1) {
			if (lines[index].trim().length > 0) {
				lines[index] = `A simple Rojo/Rokit/Wally setup for ${displayName}.`;
				break;
			}
		}

		return `${lines.join("\n").trimEnd()}\n`;
	});
}

function toLuauString(value) {
	return JSON.stringify(value);
}

function main() {
	const displayName = process.argv.slice(2).join(" ").trim();

	if (!displayName) {
		console.error("Usage: npm run init -- Project Name");
		process.exit(1);
	}

	const packageId = toPackageId(displayName);

	updatePackageJson(displayName, packageId);
	updatePackageLock(packageId);
	updateWallyFiles(packageId);
	updateReadme(displayName);
	require("./genRojoTree");

	console.log(`${displayName} initialized (${packageId}).`);
}

main();
