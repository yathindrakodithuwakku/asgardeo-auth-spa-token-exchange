const { createProxyMiddleware } = require("http-proxy-middleware");

module.exports = function (app) {
    const billingApiPathRewrite = function (path) {
        return path.replace("/subscriptions", "/api");
    };
    /* Please DONT ADD multiple `app.use` for same target, Instead add the context to the paths array */
    app.use(
        ["/api/am"],
        createProxyMiddleware({
            target: "https://apim.preview-dv.choreo.dev",
            changeOrigin: true,
            followRedirects: true
        })
    );
    app.use(
        [
            "/v2",
            // "/graphql", // GQL
            "/validate-user",
            `/validate-orgname`,
            "/register-user",
            "/user-connectors",
            "/migrate/",
            "/add-enterprise-user"
        ],
        createProxyMiddleware({
            target: "https://appv2.preview-dv.choreo.dev",
            changeOrigin: true,
            followRedirects: true
        })
    );

    app.use(
        [
            "/projects/1.0.0/graphql" // GQL
        ],
        createProxyMiddleware({
            target: "https://apis.preview-dv.choreo.dev",
            changeOrigin: true,
            followRedirects: true
        })
    );

    app.use(
        "/observability",
        createProxyMiddleware({
            target: "https://choreocontrolplane.preview-dv.choreo.dev",
            changeOrigin: true
        })
    );

    app.use(
        ["/apim", "/orgs", "/testbase", "/user", "/user-mgt", "/share-image"],
        createProxyMiddleware({
            target: "https://app.preview-dv.choreo.dev",
            changeOrigin: true,
            followRedirects: true
        })
    );
    app.use(
        ["/registry/connectors", "/registry/triggers", "/registry/packages"],
        createProxyMiddleware({
            target: "https://api.dev-central.ballerina.io/2.0",
            changeOrigin: true,
            followRedirects: true
        })
    );
    app.use(
        "/subscriptions",
        createProxyMiddleware({
            target: "https://subscriptions.dv.wso2.com",
            changeOrigin: true,
            pathRewrite: billingApiPathRewrite,
            secure: false
        })
    );
};
