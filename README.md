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

Asgardeo Auth SPA Token Exchange Plugin allows single page applications to perform token exchange grant.

This plugin manages two seperate user session instances to hold Asgardeo(IDP) and Security Token Service (STS) session data.

## Prerequisite

Create an organization in Asgardeo if you don't already have one. The organization name you choose will be referred to as `<org_name>` throughout this document.

## Try Out the Sample Apps

### Running the sample apps

1. Download the sample app from the `samples` folder.

2. Update configuration file `src/config.json` with your app details.

3. Add Choreo API endpoint under `API_ENDPOINT` property under `src/pages/home.tsx`.

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
    "stsTokenEndpoint": "<CHOREO_TOKEN_ENDPOINT_URL>",
    "resourceServerURLs": "<ADD_API_ENDPOINT_BASE_URL>"
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

## APIs

### getDecodedIDPIDToken

```typescript
getDecodedIDPIDToken(): Promise<DecodedIDTokenPayload>
```

#### Returns

A promise that returns with the IDP [`DecodedIDTokenPayload`](#DecodedIDTokenPayload) object.

#### Description

This method returns a promise that resolves with the decoded payload of the JWT ID token provided by the IDP.

#### Example

```TypeScript
getDecodedIDPIDToken().then((idToken) => {
    // console.log(idToken);
}).error((error) => {
    // console.error(error);
});
```
---


### httpRequest

```typescript
httpRequest(config: `HttpRequestConfig`): Promise<HttpResponse>;
```

#### Arguments

1. config: `[HttpRequestConfig](#httpRequestConfig)`
   A config object with the settings necessary to send http requests. This object is similar to the `AxiosRequestConfig` but provides these additional attributes:

   |Attribute|Type|Default|Description|
   |--|--|--|--|
   |`attachToken`|`boolean`|`true`|If set to `true`, the token will be attached to the request header.|
   |`shouldEncodeToFormData`|`boolean`|`false`|If set to `true`, the request body will be encoded to `FormData`. The body (specified by the `data` attribute) should be a Javascript object. |

#### Returns

A Promise that resolves with the response.

#### Description

This method is used to send http requests to the identity server. The developer doesn't need to manually attach the access token since this method does it automatically.

If the `storage` type is set to `sessionStorage` or `localStorage`, the developer may choose to implement their own ways of sending http requests by obtaining the access token from the relevant storage medium and attaching it to the header. However, if the `storage` is set to `webWorker`, this is the _ONLY_ way http requests can be sent.

This method accepts a config object which is of type `AxiosRequestConfig`. If you have used `axios` before, you can use the `httpRequest` in the exact same way.

For example, to get the user profile details after signing in, you can query the `me` endpoint as follows:

#### Example

```TypeScript
const auth = AsgardeoSPAClient.getInstance();

const requestConfig = {
    headers: {
        "Accept": "application/json",
        "Content-Type": "application/scim+json"
    },
    method: "GET",
    url: "https://api.asgardeo.io/scim2/me"
};

return httpRequest(requestConfig)
    .then((response) => {
        // console.log(response);
    })
    .catch((error) => {
        // console.error(error);
    });
```

---

### getDecodedIDToken

```typescript
getDecodedIDToken(): Promise<DecodedIDTokenPayload>
```

#### Returns

A promise that returns with the [`DecodedIDTokenPayload`](#DecodedIDTokenPayload) object.

#### Description

This method returns a promise that resolves with the decoded payload of the JWT ID token.

#### Example

```TypeScript
getDecodedIDToken().then((idToken) => {
    // console.log(idToken);
}).error((error) => {
    // console.error(error);
});
```
---


### httpRequest

```typescript
httpRequest(config: `HttpRequestConfig`): Promise<HttpResponse>;
```

#### Arguments

1. config: `[HttpRequestConfig](#httpRequestConfig)`
   A config object with the settings necessary to send http requests. This object is similar to the `AxiosRequestConfig` but provides these additional attributes:

   |Attribute|Type|Default|Description|
   |--|--|--|--|
   |`attachToken`|`boolean`|`true`|If set to `true`, the token will be attached to the request header.|
   |`shouldEncodeToFormData`|`boolean`|`false`|If set to `true`, the request body will be encoded to `FormData`. The body (specified by the `data` attribute) should be a Javascript object. |
   |`shouldAttachIDPAccessToken`|`boolean`|`false`| If set to `true`, the IDP access token will be attached to the the request `Authorization` header. |

#### Returns

A Promise that resolves with the response.

#### Description

This method is used to send http requests to the identity server. The developer doesn't need to manually attach the access token since this method does it automatically.

If the `storage` type is set to `sessionStorage` or `localStorage`, the developer may choose to implement their own ways of sending http requests by obtaining the access token from the relevant storage medium and attaching it to the header. However, if the `storage` is set to `webWorker`, this is the _ONLY_ way http requests can be sent.

This method accepts a config object which is of type `AxiosRequestConfig`. If you have used `axios` before, you can use the `httpRequest` in the exact same way.

For example, to get the user profile details after signing in, you can query the `me` endpoint as follows:

#### Example

```TypeScript
const auth = AsgardeoSPAClient.getInstance();

const requestConfig = {
    headers: {
        "Accept": "application/json",
        "Content-Type": "application/scim+json"
    },
    method: "GET",
    url: "https://api.asgardeo.io/t/{org_name}/oauth2/userinfo",
    shouldAttachIDPAccessToken: true
};

return httpRequest(requestConfig)
    .then((response) => {
        // console.log(response);
    })
    .catch((error) => {
        // console.error(error);
    });
```

---

## Models

### CustomAuthClientConfig

| Attribute         | Type      | Description                                                               |
| :---------------- | :-------- | :------------------------------------------------------------------------ |
| `stsTokenEndpoint`   | `string`  | The token exchange endpoint.                                 |
| `stsConfig`     | `STSConfig`  | STSConfig that will be passed to the `stsTokenEndpoint`.  |

### STSConfig

| Attribute | Required/Optional | Type | Default Value | Description |
| --------- | ----------------- | ---- | ------------- | ----------- |
| `client_id`          | Required          | `string`        | -                                                                      | The client ID of the Security Token Service (STS). |                       |
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
