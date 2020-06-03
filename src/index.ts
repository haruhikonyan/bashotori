import * as express from "express";
import * as path from "path";

import index from './routes/index';

const app = express();
app.set('views', path.join(__dirname, 'views')); 
app.set("view engine", "ejs");

app.use('/screenshots', express.static('screenshots'));


// CORSの許可
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*")
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept")
  next()
})

app.use('/', index);

// 3456番ポートでAPIサーバ起動
app.listen(3456,()=>{ console.log('Example app listening on port 3456!') })