// Tags the current HEAD with the version from the freshly built manifest, so
// the git tag always matches the packaged extension exactly (single source of
// truth — the version is never recomputed here). Run via `pnpm release`, which
// builds/zips first. The tag is created locally only; pushing is left to you.
import { readFileSync } from 'node:fs';
import { execSync } from 'node:child_process';

const MANIFEST = '.output/chrome-mv3/manifest.json';

let version;
try {
    ({ version } = JSON.parse(readFileSync(MANIFEST, 'utf8')));
} catch {
    console.error(`✖ ${MANIFEST} not found — run \`pnpm build\` or \`pnpm zip\` first.`);
    process.exit(1);
}

const tag = `v${version}`;
const git = (cmd) => execSync(`git ${cmd}`, { encoding: 'utf8' }).trim();

// The tag must point at a committed state, not a dirty tree. .output/ is
// git-ignored, so a fresh build/zip does not dirty the tree by itself.
if (git('status --porcelain')) {
    console.error('✖ Working tree is dirty — commit or stash before tagging.');
    process.exit(1);
}

// A same-minute rebuild would collide with an existing tag.
if (git(`tag --list ${tag}`)) {
    console.error(`✖ Tag ${tag} already exists (same-minute build?). Wait a minute and re-run.`);
    process.exit(1);
}

git(`tag -a ${tag} -m "Release ${version}"`);
console.log(`✔ Created tag ${tag}`);
console.log(`  Push it with: git push origin ${tag}`);
