# Engineering portal deployment

The canonical source is this repository. The Cloudflare custom hostname is engineering.ctdigital.group. The existing GitHub Pages deployment remains available during transition.

The release workflow checks the exact Git commit, runs the reusable security scan, and deploys the approved public file allowlist using Cloudflare Workers Static Assets. It creates an asset manifest from Git blobs, uploads missing assets, creates a version, verifies the previous production deployment has not changed, then promotes the new version. A live verification failure triggers rollback if no intervening deployment occurred. The worker only handles GET and HEAD on the intended hostname; private files and build tooling are outside the asset allowlist. The bootstrap noindex gate is preserved.

Local checks: run `node scripts/engineering-release.mjs check` from a committed checkout. The check uses committed Git objects rather than potentially modified working files. The same script's `manifest` operation outputs the asset manifest; `smoke` verifies the current exact release. Production deploys require a clean main checkout at the current remote main commit.

The workflow only deploys on main, after the check and security jobs pass, through the engineering-production environment. Configure a Cloudflare token restricted to the individual engineering Worker where supported, and the account and Worker identifiers as environment variables. Never put tokens into files, command arguments, the public repository or browser code. The production deployment switch ENGINEERING_DEPLOY_ENABLED must remain unset until the manual workflow has succeeded and live behavior has been verified. A manual dispatch is also supported.

Cloudflare reference: https://developers.cloudflare.com/workers/static-assets/direct-upload/

Do not add an asset to the release allowlist until its public content is reviewed. No private source, internal plans, or client data belong in this repository. A future SEO release must deliberately revise the indexing gate after canonical-host and indexing checks. Do not modify the corporate Worker or unrelated DNS records.
