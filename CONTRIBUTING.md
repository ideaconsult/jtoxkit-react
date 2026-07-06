## Introduction

jToxKit React is a React/Vite frontend for viewing eNanoMapper/AMBIT substance,
composition, and study data. The repository serves two outputs from one codebase: a
standalone app deployed under `/jtoxkit/` and an embeddable React component for host
applications.

The public package name is `@ideaconsult/jtoxkit-react` under the `ideaconsult` npm
organization.

## Development Workflow

- Use feature branches and pull requests for normal changes.
- Rebase feature branches regularly and avoid merge commits when pulling shared branches.
- Keep changes small and focused; this repo is a viewer library as well as an app, so
  host-specific behavior should stay outside the reusable component when possible.
- Preserve parity with legacy jToxKit behavior unless the change intentionally documents a
  React/library-specific difference.

## Tool Requirements

The basic requirement is a working `pnpm` package manager. This repository pins the
project pnpm version via `packageManager` in `package.json`, so the globally installed
pnpm is only a bootstrap tool. With modern pnpm, running `pnpm` inside this repository
automatically uses the pinned version.

Check the project-selected pnpm version from the repository root:

```sh
pnpm --version
```

If your bootstrap pnpm does not switch to the pinned version, upgrade pnpm or run the
pinned version explicitly:

```sh
npx pnpm@11.10.0 install --frozen-lockfile
```

### UNIX-Like Systems

Install `pnpm` through your operating system package manager or the official installer. For
example, on Arch Linux:

```sh
pacman -Syu pnpm
```

This will also pull Node.js if it is not already installed.

To enable Node.js version management through `pnpm env use`, run:

```sh
pnpm setup
```

This adds the necessary environment setup to your shell init file. Bash is known to work;
if you use another shell, verify the generated setup for that shell.

If you use ZFS, Btrfs, or another filesystem with integrated volume management, and your
development workspace is on a separate dataset or subvolume, consider setting `PNPM_HOME`
to a directory within that same dataset or subvolume, for example `${HOME}/dev/.pnpm`. If
you have already run `pnpm setup`, update the environment configuration it added to your
shell init file.

### Windows

Use 64-bit Windows PowerShell as a regular user. Do not run it as administrator, and do
not use Windows PowerShell (x86) or Windows PowerShell ISE.

In PowerShell, install pnpm with the official installer:

```powershell
powershell -ExecutionPolicy ByPass -c "irm https://get.pnpm.io/install.ps1 | iex"
```

Open a new terminal after installation. Editors such as Visual Studio Code may need to be
restarted completely; reopening only the integrated terminal may not be enough.

If Windows Defender blocks the pnpm executable when using this method, consult the pnpm
installation documentation for alternatives.

Once pnpm is installed, install a Node.js runtime through pnpm:

```sh
pnpm env use --global lts
```

If existing Node.js installations appear in Windows Settings -> Apps & Features, they may
take precedence over the version installed by `pnpm env`. In that case, either uninstall
those Node.js versions and manage Node.js through pnpm, or ensure that the active Node.js
version is compatible by another method such as a direct installer or nvm-windows.

### Node.js Versions

Use the current Node.js LTS release unless a project-specific issue requires otherwise.
`pnpm env use` can install and select Node.js versions globally:

```sh
pnpm env use --global lts
pnpm env use --global 24
```

List Node.js versions managed by pnpm:

```sh
pnpm env ls
```

After changing Node.js versions, verify the active tools from this repository root:

```sh
node --version
pnpm --version
```

## Setup

Install dependencies:

```sh
pnpm install --frozen-lockfile
```

Create local environment configuration when needed:

```sh
cp .env.example .env
```

Start the standalone app:

```sh
pnpm dev
```

The dev server uses Vite on port `5175` and serves the app with base path `/jtoxkit/`.

## Build And Verification

Run the test suite:

```sh
pnpm test
```

Run tests in watch mode while developing:

```sh
pnpm test:watch
```

Build the standalone app:

```sh
pnpm build
```

Build the embeddable library package:

```sh
pnpm build:lib
```

Preview a production app build:

```sh
pnpm preview
```

There are currently no configured lint, formatter, or typecheck scripts. For code changes,
run `pnpm test` and the relevant build command, then document any checks that are
unavailable or skipped.

Before publication or packaging changes, also run:

```sh
pnpm install --frozen-lockfile
pnpm peers check
pnpm test
pnpm build
pnpm build:lib
pnpm pack --dry-run
```

Verify `dist/jtoxkit-react.js` has no `import.meta.env` or `VITE_` references before
release.

## Local Host Integration Development

Use the standalone app for the fastest feedback while working on viewer internals:

```sh
pnpm dev
```

This serves the package's own `/jtoxkit/` app directly from `src/` through Vite.

When a change must be checked inside a host app such as `spectrasearch`, prefer a local
pnpm link over changing the host's committed dependency spec. The library package exposes
the built `dist/` entry, so keep the library build running in watch mode:

```sh
# in jtoxkit-react
pnpm build:lib -- --watch
```

In the host app, link the local checkout and force Vite to rebuild its optimized dependency
cache:

```sh
# in spectrasearch, assuming sibling checkouts under the same parent directory
pnpm link ../jtoxkit-react
pnpm dev -- --force
```

If a later library rebuild is not picked up by the browser, restart the host dev server
with `pnpm dev -- --force` again. To return the host to normal registry dependencies:

```sh
pnpm unlink @ideaconsult/jtoxkit-react
pnpm install --frozen-lockfile
pnpm dev -- --force
```

Use `pnpm pack` for package-consumer smoke tests, not for everyday live debugging. This
checks the exact tarball contents a consumer would install:

```sh
# in jtoxkit-react
pnpm build:lib
pnpm pack --pack-destination /tmp/viewer-packs
```

Then, in a host app and preferably on a throwaway branch:

```sh
pnpm add /tmp/viewer-packs/ideaconsult-jtoxkit-react-0.1.0.tgz
pnpm dev -- --force
```

Installing a tarball modifies `package.json` and `pnpm-lock.yaml`; restore the normal semver
dependency before committing. Committed `file:` or local `.tgz` dependencies are not a
release or CI distribution strategy.

## Embedding Contract

Consumers should depend on the npm package and import the component and CSS:

```jsx
import SubstanceStudyViewer from "@ideaconsult/jtoxkit-react";
import "@ideaconsult/jtoxkit-react/style.css";
```

The reusable component is `SubstanceStudyViewer`. It accepts AMBIT substance identifiers,
backend configuration, auth token, display options, a legacy-compatible study column
configuration, and an optional data-source adapter as props. Standalone URL parsing belongs
in `src/App.jsx`; do not add URL parsing requirements to the reusable component.

Standalone Vite environment variables also belong in `src/App.jsx`. Reusable library code
should receive AMBIT, conversion, proxy, auth, and display configuration through
props/context rather than reading `import.meta.env`.

Keep React and ReactDOM as peer dependencies. The library build externalizes React,
ReactDOM, and optional `@observablehq/plot`, and emits `dist/jtoxkit-react.js` plus
`dist/style.css`. `dompurify` is bundled as a runtime dependency for sanitizing legacy
renderer HTML.

## Auth And Backend Expectations

- The viewer must never initiate Keycloak login or redirect flow.
- Embedded hosts pass a token prop when authenticated.
- Standalone mode passively reads `?token=`, `sessionStorage`, or `postMessage`.
- The UI should still render without a token; public data should work and protected
  resources should degrade gracefully.
- Data access goes through the `data/source.js` adapter interface. The default AMBIT adapter
  performs AMBIT REST calls and returns AMBIT-shaped objects.
- Custom adapters, including a future Solr/ramanchada-api adapter, should preserve AMBIT
  shapes so the legacy study configs and renderers keep working unchanged.

## Legacy Config Compatibility

The bundled study config is a faithful port of the legacy jToxKit configuration. Keep
`src/config/*.js` drop-in compatible with host-provided `config_study` objects.

Render callbacks may return HTML strings. They must be rendered only through the sanitized
`<Html>` helper. Do not inject render output directly with raw `dangerouslySetInnerHTML`.

## Publishing

Before any npm release:

1. Reconcile the lockfile with `package.json`.
2. Run `pnpm install --frozen-lockfile`, `pnpm peers check`, `pnpm test`, `pnpm build`, and
   `pnpm build:lib`.
3. Verify the package contents with `pnpm pack --dry-run`.
4. Verify `dist/jtoxkit-react.js` has no `import.meta.env` or `VITE_` references.

npm publication is handled by `.github/workflows/publish.yml` using npm trusted
publishing/OIDC and the GitHub `npm` environment. Releases do not use long-lived npm
publish tokens.

For releases:

1. Update `package.json` version in a normal pull request.
2. Merge after CI passes.
3. Tag the merge commit as `vX.Y.Z`, matching `package.json` exactly.
4. Create and publish a GitHub Release from that tag.
5. The `Publish to npm` workflow validates the tag, rebuilds the package, and publishes to
   npm via OIDC trusted publishing.

Local `file:` dependencies are acceptable only for development while iterating across
repositories. They are not a release or CI distribution strategy.

## Dependency Update Security

pnpm enforces a minimum package release age before accepting dependencies into the
lockfile. This reduces exposure to newly published malicious packages and compromised
releases that are often detected and removed shortly after publication.

Routine dependency updates should wait for the release-age window and pass the available
verification checks. Once Dependabot and CI are configured, routine updates should wait for
those checks too. Do not bypass the release-age policy only to make a routine update merge
sooner.

For an emergency CVE fix that cannot wait for the configured release-age window:

1. Confirm that this project is affected and that waiting would create unacceptable risk.
2. Review the release manually, including the advisory, changelog, package diff,
   publisher/provenance information where available, install scripts, and new transitive
   dependencies.
3. Add a temporary, version-specific exception in `pnpm-workspace.yaml`, for example:

```yaml
minimumReleaseAgeExclude:
  - vulnerable-package@1.2.3
```

4. Reference the advisory and the manual review in the pull request.
5. Remove the exception after the package version is older than the configured release-age
   window.

## Tooling Direction

This repository uses pnpm and has no lint or format toolchain. Future tooling migrations
should be done deliberately, preferably in their own changes, with updated docs and
lockfile changes.

Biome and Lefthook would be reasonable choices for consistency with related frontend
projects, but do not mix those migrations into unrelated feature work.

## Documentation Maintenance

- Update `AGENTS.md`, `README.md`, and this file when install commands, scripts,
  verification steps, packaging, release flow, backend routes, auth behavior, or integration
  contracts change.
- Update host documentation, especially `spectrasearch/docs/VIEWERS.md`, when viewer
  package names, semver ranges, route behavior, or embedding props change.
