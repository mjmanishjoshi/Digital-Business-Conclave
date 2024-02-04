const express = require('express');
const path = require('path');
const { createProxyMiddleware } = require('http-proxy-middleware');
const app = express();

app.use('/graphql', createProxyMiddleware({
    target: 'http://localhost:8800/graphql',
    changeOrigin: true,
    secure: false,
    pathRewrite: {
        '^/graphql': ''
    },
    logLevel: 'debug'
}));
app.use(express.static(path.join(__dirname, 'app/dist/app')));
app.use((req, res) => {
    res.sendFile(path.join(__dirname, 'app/dist/app', 'index.html'));
});

const port = process.env.PORT || 3000;
app.listen(port, function () {
    console.log('Server listening on port ' + port);
});