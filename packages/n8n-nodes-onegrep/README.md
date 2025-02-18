ESM Moduels not supported in n8n?

https://github.com/n8n-io/n8n/issues/9464

Everything must be in CJS format, including all dependencies.

This means that it's best to bundle it all together for distribution.

However, it also expects certain naming conventions, which the linter will complain about.

In the package.json, you must define two SEPARATE files, one for credentials and one for the node.

The credentials file must be named `credentials/{CapitalizedCredentialName}.credentials.cjs`.
The node file must be named `nodes/{lowercase-node-name}/{CapitalizedNodeName}.node.cjs`

Thus, I was able to get it to work with a local n8n install when we create a CJS only bundle, copy the bundle file to be named according to convention, then install in the `.n8n/nodes` directory with the package.json for testing.  If this is published to npm, we should be able to install using the standard UI for community nodes.

Pino v7-9 depends on thread-stream, which is not bundled in CJS automatically.

We can provide a mode where it has no logging, but we can additionally bring in the thread-stream dependency as part of tsup config. Related docs: https://github.com/pinojs/pino/blob/main/docs/bundling.md

n8n requires Node <=22, so for now we should use 20.

