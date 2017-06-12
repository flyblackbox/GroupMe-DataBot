import express from 'express';
import cors from 'cors';
import {apolloServer} from 'apollo-server';
import Schema from './data/schema';
import Resolvers from './data/resolvers';

// import Mocks from './data/mocks';

const GRAPHQL_PORT = (process.env.PORT || 5000);
const WS_PORT = 8080;

const graphQLServer = express();
const corsOptions = {
    origin(origin, callback){
        callback(null, true);
    },
    credentials: true
};
graphQLServer.use('/graphql', apolloServer({
    graphiql: true,
    pretty: true,
    schema: Schema,
    resolvers: Resolvers
    // mocks: Mocks,
}));

graphQLServer.all('/', function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Cache-Control, Pragma, Origin, Authorization, Content-Type, X-Requested-With');
    res.header('Access-Control-Allow-Methods', 'GET');
    return next();
});

graphQLServer.get('/callback', function (req, res, next) {
    res.send('Sending updates to server...');
    return next();
})

graphQLServer.use(cors(corsOptions));

graphQLServer.listen(GRAPHQL_PORT, () => console.log(
    `GraphQL Server is now running on http://localhost:${GRAPHQL_PORT}/graphql`
));
