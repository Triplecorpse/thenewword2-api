import * as express from 'express';
import * as dotenv from 'dotenv';

dotenv.config();

const app = express();

app.listen(process.env.PORT, () => {
    console.log('listening on port', process.env.PORT);
});