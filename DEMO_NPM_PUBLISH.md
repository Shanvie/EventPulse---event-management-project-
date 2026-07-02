# Demo: Scoped package `name` and GitHub Packages registry

This demo shows how to configure a scoped package name and publish to GitHub Packages.

1. Replace `NAMESPACE` in `.npmrc` with your GitHub username or organization. Example:

```
@my-org:registry=https://npm.pkg.github.com
```

2. Ensure your project's `package.json` `name` field includes the scope. Example:

```
{
  "name": "@my-org/my-package",
  "version": "1.0.0",
  "main": "index.js"
}
```

3. Authenticate to GitHub Packages. Create a personal access token (PAT) with `write:packages` and `read:packages` scopes. Then either:

- Use `npm login --scope=@my-org --registry=https://npm.pkg.github.com` and enter your GitHub username and PAT as password, or
- Create an auth token in `.npmrc` (less secure) like:

```
//npm.pkg.github.com/:_authToken=YOUR_PERSONAL_ACCESS_TOKEN
```

4. Publish:

```
npm publish --registry=https://npm.pkg.github.com
```

5. Example: a minimal `index.js` to publish:

```
module.exports = function greet(name) {
  return `Hello, ${name}!`;
}
```

Notes:
- Make sure the `repository` field in `package.json` matches your GitHub repo URL.
- For private packages, add `"private": false` if needed and configure visibility via GitHub.
# Demo: Scoped package `name` and GitHub Packages registry

This demo shows how to configure a scoped package name and publish to GitHub Packages.

1. Replace `NAMESPACE` in `.npmrc` with your GitHub username or organization. Example:

```
@my-org:registry=https://npm.pkg.github.com
```

2. Ensure your project's `package.json` `name` field includes the scope. Example:

```
{
  "name": "@my-org/my-package",
  "version": "1.0.0",
  "main": "index.js"
}
```

3. Authenticate to GitHub Packages. Create a personal access token (PAT) with `write:packages` and `read:packages` scopes. Then either:

- Use `npm login --scope=@my-org --registry=https://npm.pkg.github.com` and enter your GitHub username and PAT as password, or
- Create an auth token in `.npmrc` (less secure) like:

```
//npm.pkg.github.com/:_authToken=YOUR_PERSONAL_ACCESS_TOKEN
```

4. Publish:

```
npm publish --registry=https://npm.pkg.github.com
```

5. Example: a minimal `index.js` to publish:

```
module.exports = function greet(name) {
  return `Hello, ${name}!`;
}
```

Notes:
- Make sure the `repository` field in `package.json` matches your GitHub repo URL.
- For private packages, add `"private": false` if needed and configure visibility via GitHub.
