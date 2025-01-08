# posthog-scan

[![npm](https://img.shields.io/npm/v/posthog-scan?logo=npm&style=flat&labelColor=000&color=3b82f6)](https://www.npmjs.org/package/posthog-scan)
[![npm downloads](https://img.shields.io/npm/dw/posthog-scan?logo=npm&style=flat&labelColor=000&color=3b82f6)](https://www.npmjs.org/package/posthog-scan)

Scan your code for PostHog events (`posthog.capture` calls) and generate a markdown file with the events and their properties.

## Usage

run `npx posthog-scan` in your project directory (will scan all files in the `src` directory).

```bash
npx posthog-scan
```

`posthog.md` file will be created in the root of your project.

it will look like this:

```md
## Events

-   [test](#test)

### test

-   `email`: `undefined | string`
-   `test`: `undefined | number`
```

> [!IMPORTANT]
> For now, it only works for `posthog` name of PostHog instance.

## Why

It will help you to keep your events in one place and generate documentation for them (so you can share it with your team).
I am also wants to use `ts-morph` in one of my projects.

## TODO

-   [ ] Check `posthog-node` not `posthog.capture`
-   [ ] Add more customization at CLI
