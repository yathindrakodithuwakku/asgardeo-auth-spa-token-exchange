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

import { Hooks, useAuthContext } from "@asgardeo/auth-react";
import React, {
    FunctionComponent,
    ReactElement,
    useEffect,
    useState
} from "react";
import { default as authConfig } from "../config.json";
import REACT_LOGO from "../images/react-logo.png";
import { DefaultLayout } from "../layouts/default";
import { useNavigate, useLocation } from "react-router-dom";
import { LogoutRequestDenied } from "../components/LogoutRequestDenied";
import { USER_DENIED_LOGOUT } from "../constants/errors";

/**
 * Decoded ID Token Response component Prop types interface.
 */
type LandingPagePropsInterface = {};

/**
 * Landing page for the Sample.
 *
 * @param {LandingPagePropsInterface} props - Props injected to the component.
 *
 * @return {React.ReactElement}
 */
export const LandingPage: FunctionComponent<
    LandingPagePropsInterface
> = (): ReactElement => {
    const { state, signIn, signOut, on } = useAuthContext();

    const navigate = useNavigate();

    const [hasAuthenticationErrors, setHasAuthenticationErrors] =
        useState<boolean>(false);
    const [hasLogoutFailureError, setHasLogoutFailureError] =
        useState<boolean>();

    const search = useLocation().search;
    const stateParam = new URLSearchParams(search).get("state");
    const errorDescParam = new URLSearchParams(search).get("error_description");

    useEffect(() => {
        if (!state?.isAuthenticated) {
            return;
        }

        navigate("/signin");
    }, [state.isAuthenticated, navigate]);

    useEffect(() => {
        if (stateParam && errorDescParam) {
            if (errorDescParam === "End User denied the logout request") {
                setHasLogoutFailureError(true);
            }
        }
    }, [stateParam, errorDescParam]);

    /**
     * handles the error occurs when the logout consent page is enabled
     * and the user clicks 'NO' at the logout consent page
     */
    useEffect(() => {
        on(Hooks.SignOut, () => {
            setHasLogoutFailureError(false);
        });

        on(Hooks.SignOutFailed, () => {
            if (!errorDescParam) {
                handleLogin();
            }
        });
    }, [on]);

    const handleLogin = () => {
        setHasLogoutFailureError(false);
        signIn().catch(() => {
            setHasAuthenticationErrors(true);
        });
    };

    const handleLogout = () => {
        signOut();
    };

    // If `clientID` is not defined in `config.json`, show a UI warning.
    if (!authConfig?.clientID) {
        return (
            <div className="content">
                <h2>You need to update the Client ID to proceed.</h2>
                <p>
                    Please open "src/config.json" file using an editor, and
                    update the <code>clientID</code> value with the registered
                    application's client ID.
                </p>
                <p>
                    Visit repo{" "}
                    <a href="https://github.com/asgardeo/asgardeo-auth-spa-token-exchange/tree/master/samples/asgardeo-react-app">
                        README
                    </a>{" "}
                    for more details.
                </p>
            </div>
        );
    }

    if (hasLogoutFailureError) {
        return (
            <LogoutRequestDenied
                errorMessage={USER_DENIED_LOGOUT}
                handleLogin={handleLogin}
                handleLogout={handleLogout}
            />
        );
    }

    return (
        <DefaultLayout
            isLoading={state.isLoading}
            hasErrors={hasAuthenticationErrors}
        >
            <div className="content">
                <div className="home-image">
                    <img src={REACT_LOGO} className="react-logo-image logo" alt="react logo" />
                </div>
                <h4 className={"spa-app-description"}>
                    Sample demo to showcase authentication for a Single Page
                    Application via the OpenID Connect Authorization Code flow,
                    which is integrated using the&nbsp;
                    <a
                        href="https://github.com/asgardeo/asgardeo-auth-spa-token-exchange"
                        target="_blank"
                        rel="noreferrer"
                    >
                        Asgardeo Auth SPA Token Exchange
                    </a>
                    .
                </h4>
                <button
                    className="btn primary"
                    onClick={() => {
                        handleLogin();
                    }}
                >
                    Login
                </button>
            </div>
        </DefaultLayout>
    );
};
