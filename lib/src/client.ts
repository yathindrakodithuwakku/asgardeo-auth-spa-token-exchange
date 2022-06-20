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
    AsgardeoSPAClient,
    AuthSPAClientConfig,
    AuthenticationHelper,
    DataLayer,
    MainThreadClientConfig
} from "@asgardeo/auth-spa";
import WorkerFile from "web-worker:./worker.ts";
import { TokenExchangeAuthenticationHelper } from "./helpers/authentication-helper";

const PRIMARY_INSTANCE = "primaryInstance";

export interface STSConfig {
    client_id: string;
    scope: string[];
    resource?: string;
    audience?: string;
    actor_token?: string;
    actor_token_type?: string;
    [x: string]: any;
}

export interface CustomAuthClientConfig {
    stsTokenEndpoint?: string;
    stsConfig?: STSConfig;
}

export type STSClientConfig = AuthSPAClientConfig & CustomAuthClientConfig;

/**
 * This class provides the methods to implement token exchange grant in a Single Page Application.
 *
 * @export
 * @class TokenExchangePlugin
 */
export class TokenExchangePlugin extends AsgardeoSPAClient {
    public static getInstance(id?: string): AsgardeoSPAClient | undefined {
        if (id && TokenExchangePlugin._instances?.get(id)) {
            return this._instances.get(id);
        } else if (!id && this._instances?.get(PRIMARY_INSTANCE)) {
            return this._instances.get(PRIMARY_INSTANCE);
        }

        if (id) {
            this._instances.set(id, new TokenExchangePlugin(id));

            return this._instances.get(id);
        }

        this._instances.set(
            PRIMARY_INSTANCE,
            new TokenExchangePlugin(PRIMARY_INSTANCE)
        );

        return this._instances.get(PRIMARY_INSTANCE);
    }

    public async initialize(config: STSClientConfig): Promise<boolean> {
        const authHelper: typeof AuthenticationHelper =
            TokenExchangeAuthenticationHelper;
        return await super.initialize(config, authHelper, WorkerFile);
    }

    public async getIDPAccessToken(): Promise<string> {
        const dataLayer: DataLayer<MainThreadClientConfig> =
            await super.getDataLayer();

        return (await dataLayer.getSessionData())?.access_token;
    }
}
