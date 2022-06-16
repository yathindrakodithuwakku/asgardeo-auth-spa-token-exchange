# asgardeo-auth-spa-token-exchange
Token Exchange Grant Plugin for Single Page Applications (SPA) to be used with Asgardeo.

![Builder](https://github.com/asgardeo/asgardeo-auth-spa-token-exchange/workflows/Builder/badge.svg)
[![Stackoverflow](https://img.shields.io/badge/Ask%20for%20help%20on-Stackoverflow-orange)](https://stackoverflow.com/questions/tagged/wso2is)
[![Join the chat at https://join.slack.com/t/wso2is/shared_invite/enQtNzk0MTI1OTg5NjM1LTllODZiMTYzMmY0YzljYjdhZGExZWVkZDUxOWVjZDJkZGIzNTE1NDllYWFhM2MyOGFjMDlkYzJjODJhOWQ4YjE](https://img.shields.io/badge/Join%20us%20on-Slack-%23e01563.svg)](https://join.slack.com/t/wso2is/shared_invite/enQtNzk0MTI1OTg5NjM1LTllODZiMTYzMmY0YzljYjdhZGExZWVkZDUxOWVjZDJkZGIzNTE1NDllYWFhM2MyOGFjMDlkYzJjODJhOWQ4YjE)
[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://github.com/wso2/product-is/blob/master/LICENSE)
[![Twitter](https://img.shields.io/twitter/follow/wso2.svg?style=social&label=Follow)](https://twitter.com/intent/follow?screen_name=wso2)

---

## Table of Content

-   [Introduction](#introduction)
-   [Prerequisite](#prerequisite)
-   [Getting Started](#getting-started)
-   [Try Out the Sample Apps](#try-out-the-sample-apps)
-   [Models](#models)
    -   [CustomAuthClientConfig](#CustomAuthClientConfig)
    -   [STSConfig](#STSConfig)
-   [Develop](#develop)
    -   [Prerequisites](#prerequisites)
    -   [Installing Dependencies](#installing-dependencies)
-   [Contribute](#contribute)
-   [License](#license)

## Introduction

Asgardeo Auth SPA Token Exchange Plugin allows React applications to perform token exchange grant.

## Prerequisite

Create an organization in Asgardeo if you don't already have one. The organization name you choose will be referred to as `<org_name>` throughout this document.

## Try Out the Sample Apps

### Running the sample apps

1. Download the sample app from the `samples` folder.

2. Update configuration file `src/config.json` with your app details.

**Note:** You need `stsConfig` and `stsTokenEndpoint`additional to the default Asgardeo Auth Client configuration declared in the React SDK Documentation [here](https://github.com/asgardeo/asgardeo-auth-react-sdk#configuration).

Read more about the stsConfig [here](#STSConfig).

```json
{
    "clientID": "",
    "baseUrl": "https://api.asgardeo.io/t/<org_name>",
    "signInRedirectURL": "https://localhost:3000/signin",
    "signOutRedirectURL": "https://localhost:3000/login",
    "scope": ["openid","email","profile"],
    "stsConfig": {
        "client_id": "",
        "scope": [],
        "orgHandle": "",
    },
    "stsTokenEndpoint": ""
}

```

3. Build and deploy the apps by running the following command at the root directory.

```bash
npm install && npm start
```

4. Navigate to [`https://localhost:3000`](https://localhost:3000) (or whichever the URL you have hosted the sample app).

## Getting Started

### 1. Installing the Package

Install the library from the npm registry.

```
npm install --save @asgardeo/token-exchange-plugin
```

### 2. Import `AuthProvider`, `useAuthContext` and Provide Configuration Parameters

```TypeScript
// The SDK provides a provider that can be used to carry out the authentication.
// The `AuthProvider` is a React context.
// `useAuthContext` is a React hook that provides you with authentication methods such as `signIn`.
import { AuthProvider, useAuthContext } from "@asgardeo/auth-react";
import { TokenExchangePlugin } from "@asgardeo/token-exchange-plugin";

// Add additional `stsConfig` and `stsTokenEndpoint`.
const config = {
     signInRedirectURL: "https://localhost:3000/signin",
     signOutRedirectURL: "https://localhost:3000/login",
     clientID: "client ID",
     baseUrl: "https://api.asgardeo.io/t/<org_name>",
     stsConfig: {
        "client_id": "",
        "scope": []
    },
    stsTokenEndpoint: ""
};

// Encapsulate your components with the `AuthProvider`and pass an instance of TokenExchangePlugin.
export const MyApp = (): ReactElement => {
    return (
        <AuthProvider config={ config } plugin={ TokenExchangePlugin.getInstance() }>
            <Dashboard />
        </AuthProvider>
    )
}

const Dashboard = (): ReactElement => {
    const { signIn } = useAuthContext();
    const [ signedIn, setSignedIn ] = useState(false);

    const handleClick = (): void => {
        signIn(() => {
            setSignedIn(true);
        });
    }

    return (
        <div>
            { signedIn && <div>You have signed in!</div> }
            <button onClick={handleClick}> Sign In </button>
        </div>
    );
}
```

[Learn more](#apis).

## Models

### CustomAuthClientConfig

| Attribute         | Type      | Description                                                               |
| :---------------- | :-------- | :------------------------------------------------------------------------ |
| `stsTokenEndpoint`   | `string`  | The token exchange endpoint.                                 |
| `stsConfig`     | `STSConfig`  | STSConfig that will be passed to the `stsTokenEndpoint`.  |

### STSConfig

| Attribute | Required/Optional | Type | Default Value | Description |
| --------- | ----------------- | ---- | ------------- | ----------- |
| `client_id`          | Required          | `string`        | ""                                                                      | The client ID of the Security Token Service (STS). |                       |
| `scope`                      | Required          | `string[]`      | `["openid"]`                                                            | Specifies the requested scopes.                                                                      |
| `resource`               | Optional            | `string`        | ""                                                                      | The resource in which client intends to use the requested token.    
| `audience`               | Optional            | `string`        | ""                                                                      | The target service in which client intends to use the requested token.                                   |
| `actor_token`                  | Optional           | `string` | "" | A security token that represents the identity of the acting party.
| `actor_token_type`                  | Optional           | `string` | "" | Type of the security token in the `actor_token` parameter.

**Note:** STSConfig also allows passing custom key-value pairs, which is intenteded to pass into the STSTokenEndpoint.

## Develop

### Prerequisites

-   `Node.js` (version 10 or above).
-   `yarn` package manager.

### Installing Dependencies

The repository is a mono repository. The plugin repository is found in the [lib]() directory.

## Contribute

Please read [Contributing to the Code Base](http://wso2.github.io/) for details on our code of conduct, and the process for submitting pull requests to us.

### Reporting issues

We encourage you to report issues, improvements, and feature requests creating [Github Issues](https://github.com/asgardeo/asgardeo-auth-react-sdk/issues).

Important: And please be advised that security issues must be reported to security@wso2com, not as GitHub issues, in order to reach the proper audience. We strongly advise following the WSO2 Security Vulnerability Reporting Guidelines when reporting the security issues.

## License

This project is licensed under the Apache License 2.0. See the [LICENSE](LICENSE) file for details.
