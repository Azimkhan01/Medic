const express = require('express');
const app = express();
const path = require('path');
const router = require('./router/routes');
const cors = require('cors');
require('dotenv').config();
require('./database/db');
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use("/",router);
require('dotenv').config();
app.listen(process.env.PORT,'127.0.0.1',()=>{
    console.log(`Server is running on port ${process.env.PORT} ... `);
})