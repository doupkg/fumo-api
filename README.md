by leoua @leoxyzua, thats why its branch is `main` and not `master` - hyduez @hyduez
sybau - leoua @leoxyzua

Original idea: https://github.com/nosesisaid/fumo-api

> [!IMPORTANT]
> This API is WIP (Work In Progress), it will be refactor to ElysiaJS to use OpenAPI standard and generate an autonomous documentation

> [!NOTE]
> The Discord App enchanced by Gateway (a http bot), could be removed to test locally and the rest API will work fine

endpoints:

- /fumos
- /random
- /get (required id query)
- /characters

response of all endpoints:

```typescript
{ filtered: boolean, data: data | data[] }
```

data structure:

```typescript
{ id: string, url: string, filetype: "gif" | "png" | "jpg" | "webp", title: string, fumos: characters[]  }
```

characters can be found at `src/data/fumos.json` :)

> [!NOTE]
> Although we use MongoDB clusters to store our database, you are highly recommended to use it locally create one local with MeowDB or QuickDB instead of Mongoose. Btw, we use redis to make it faster and storage a local cache

Powered by [bun](https://bun.sh/), docker and onrecord. Nix is just for development

```

```
