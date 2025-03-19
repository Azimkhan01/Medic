const  mongoose = require('mongoose');
mongoose.connect(process.env.MONGO_URI).then(()=>{
console.log("Database connected successfully");
}).catch((err)=>{
console.log("some error occured while connecting to database:"+err);
})
const medicineSchema = require('./medicineSchema');
const med = mongoose.model('Medicine',medicineSchema);
module.exports = {med};
