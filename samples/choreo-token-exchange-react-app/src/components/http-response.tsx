/**
 * Copyright (c) 2022, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
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

import React, { FunctionComponent, ReactElement } from "react";
import ReactJson from "react-json-view";

/**
 * Decoded ID Token Response component Prop types interface.
 */
interface HttpResponsePropsInterface {
    /**
     * Response from the `HttpRequest` function.
     */
     httpResponse?: any;
}

export interface HttpResponseInterface {
    /**
     * Response from the `HttpRequest` function.
     */
    httpResponse: Record<string, unknown>;
}

/**
 * Displays the derived Http Response from the SDK.
 *
 * @param {HttpResponsePropsInterface} props - Props injected to the component.
 *
 * @return {React.ReactElement}
 */
export const HttpResponse: FunctionComponent<HttpResponsePropsInterface> = (
    props: HttpResponsePropsInterface
): ReactElement => {

    const {
        httpResponse
    } = props;

    return (
        <>
            <h2 className="my-4">Http Response</h2>
            {
                httpResponse ? (
                    <div className="json">
                        <ReactJson
                            src={ httpResponse }
                            name={ null }
                            enableClipboard={ false }
                            displayObjectSize={ false }
                            displayDataTypes={ false }
                            iconStyle="square"
                            theme="monokai"
                        />
                    </div>
                ) : null
            }
        </>
    );
};
