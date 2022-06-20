/**
 * Copyright (c) 2022, WSO2 Inc. (http://www.wso2.com) All Rights Reserved.
 *
 * WSO2 Inc. licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import {
    AsgardeoAuthClient,
    AsgardeoAuthException,
    AuthClientConfig,
    AuthenticationHelper,
    BasicUserInfo,
    DecodedIDTokenPayload,
    MainThreadClientConfig,
    SPACustomGrantConfig,
    SPAHelper,
    WebWorkerClientConfig
} from "@asgardeo/auth-spa";
import { CustomAuthClientConfig } from "../client";
import {
    GRANT_TYPE,
    REQUESTED_TOKEN_TYPE,
    SUBJECT_TOKEN_TYPE
} from "../constants/exchange";
import { StsStore } from "../constants/stsStore";

export interface StsExchangeResponse {
    access_token: string;
    expires_in: number;
    issued_token_type: string;
    scope: string;
    token_type: string;
    id_token: string;
}

export interface TokenExchangeConfig {
    grant_type: string;
    subject_token: string;
    subject_token_type: string;
    scope?: string;
    requested_token_type?: string;
    client_id?: string;
    resource?: string;
    audience?: string;
    actor_token?: string;
    actor_token_type?: string;
    [x: string]: any;
}

export class TokenExchangeAuthenticationHelper<
    T extends MainThreadClientConfig | WebWorkerClientConfig
> extends AuthenticationHelper<T> {
    public constructor(
        authClient: AsgardeoAuthClient<T>,
        spaHelper: SPAHelper<T>
    ) {
        super(authClient, spaHelper);
    }

    public async exchangeAccessToken(): Promise<void> {
        const accessToken = await super.getAccessToken();

        const config =
            (await this._dataLayer.getConfigData()) as AuthClientConfig<CustomAuthClientConfig>;

        if (!accessToken) {
            throw new AsgardeoAuthException(
                "TOKEN_EXCHANGE-AUTH_HELPER-RAT2-NF01",
                "Invalid access token.",
                "Failed retrieving access token."
            );
        }

        const exchangeGrantData: TokenExchangeConfig = {
            grant_type: GRANT_TYPE,
            requested_token_type: REQUESTED_TOKEN_TYPE,
            subject_token: accessToken,
            subject_token_type: SUBJECT_TOKEN_TYPE
        };

        for (const key in config?.stsConfig) {
            let value: string | string[] = config?.stsConfig[key];

            if (key === "scope" && Array.isArray(value)) {
                value = value.join(" ");
            }
            exchangeGrantData[key] = value;
        }

        const formBody: string[] = [];

        for (const property in exchangeGrantData) {
            const encodedKey: string = encodeURIComponent(property);
            const encodedValue: string = encodeURIComponent(
                exchangeGrantData[property]
            );
            formBody.push(`${encodedKey}=${encodedValue}`);
        }

        const requestOptions: RequestInit = {
            body: formBody.join("&"),
            credentials: "include",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                authorization: `Bearer ${accessToken}`
            },
            method: "POST",
            mode: "cors"
        };

        try {
            const res = await fetch(config?.stsTokenEndpoint ?? "", requestOptions);
            if (!res.ok) {
                throw new AsgardeoAuthException(
                    "TOKEN_EXCHANGE-AUTH_HELPER-EAT1-NE01",
                    "Invalid exchanging token response",
                    "Token exchange grant has been failed"
                );
            }

            const responseBody: StsExchangeResponse = await res.json();

            if (responseBody?.access_token) {
                await this._dataLayer.setCustomData(
                    StsStore.SessionData,
                    responseBody
                );
            }

        } catch (error) {
            throw new AsgardeoAuthException(
                "TOKEN_EXCHANGE-AUTH_HELPER-EAT1-NE02",
                "Error in exchanging token",
                "Token exchange grant has been failed"
            );
        }
    }

    public async requestAccessToken(
        authorizationCode?: string,
        sessionState?: string,
        checkSession?: () => Promise<void>,
        pkce?: string,
        state?: string
    ): Promise<BasicUserInfo> {
        try {
            const userInfo = await super.requestAccessToken(
                authorizationCode,
                sessionState,
                checkSession,
                pkce,
                state
            );

            await this.exchangeAccessToken();

            return userInfo;
        } catch (error: any) {
            return Promise.reject(
                new AsgardeoAuthException(
                    "TOKEN_EXCHANGE-AUTH_HELPER-RAT3-NF01",
                    error?.name ?? "Failed requesting access token.",
                    error?.message ?? "Failed retrieving user info."
                )
            );
        }
    }

    public async getAccessToken(): Promise<string> {
        const stsSessionData: StsExchangeResponse =
            await this._dataLayer.getCustomData<StsExchangeResponse>(
                StsStore.SessionData
            );

        return stsSessionData?.access_token;
    }

    public async refreshAccessToken(
        enableRetrievingSignOutURLFromSession?: (
            config: SPACustomGrantConfig
        ) => void
    ): Promise<BasicUserInfo> {
        const userInfo = await super.refreshAccessToken(
            enableRetrievingSignOutURLFromSession
        );

        await this.exchangeAccessToken();

        return userInfo;
    }

    public async getDecodedIDToken(): Promise<DecodedIDTokenPayload> {
        // TODO Uncomment this once choreo STS enable id token in the response. 
        // Temporarily referring to IDP session data
        // const stsSessionData =
        //     await this._dataLayer.getCustomData<StsExchangeResponse>(
        //         StsStore.SessionData
        //     );

        const stsSessionData =
            await this._dataLayer.getSessionData();

        const idToken = stsSessionData?.id_token;

        if(!idToken) {
            return Promise.reject(
                new AsgardeoAuthException(
                    "TOKEN_EXCHANGE-AUTH_HELPER-GDIT-NF01",
                    "Failed requesting access token.",
                    "Failed retrieving user info."
                )
            );
        }

        const cryptoHelper = await super.getCryptoHelper();

        const payload: DecodedIDTokenPayload = cryptoHelper.decodeIDToken(idToken);

        return payload;
    }
}
