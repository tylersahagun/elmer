# Product Repositories

Add your product codebases here as git submodules.

## Adding a Repository

```bash
git submodule add <repo-url> product-repos/<repo-name>
```

## Examples

```bash
# GitHub SSH
git submodule add git@github.com:myorg/my-app.git product-repos/my-app

# GitHub HTTPS
git submodule add https://github.com/myorg/my-app.git product-repos/my-app
```

## After Adding

1. Run `git submodule update --init --recursive` to initialize
2. Update `elmer-docs/workspace-config.json` to register the repo
3. Run `/setup` to configure prototyping paths

## Structure

Each repo should have a structure the workspace can understand:

```
product-repos/
└── my-app/
    └── src/
        └── components/
            └── prototypes/    # Prototype components go here
```

If your repo doesn't have a `prototypes/` folder, use the standalone `prototypes/` folder at the workspace root instead.
