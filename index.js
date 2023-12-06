const express = require('express')
const app = express()
const cors = require('cors')
const bodyparser = require('body-parser')

require('dotenv').config()
var mongoose = require('mongoose');

app.use(cors())
app.use(bodyparser.urlencoded({extended: "false"}))
app.use(bodyparser.json())

app.use(express.static('public'))
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/views/index.html')
});

mongoose.connect(process.env.MONGO_URI);

const userSchema = new mongoose.Schema({
    username: String,
    logs: [{
        description: String,
        duration: String,
        date: String,
    }]
});

const User = mongoose.model('User', userSchema);

app.post('/api/users', async (req, res) => {

    const {username} = req.body;

    const data = await User.create({username});

    res.json({username, _id: data._id});
});

app.get('/api/users', async (req, res) => {

    const data = await User.find();

    res.json(data);
});

app.post('/api/users/:_id/exercises', async (req, res) => {

    let userId = req.params._id;
    let {description, duration, date} = req.body;

    if (!date) {
        date = new Date().toDateString();
    }

    const data = await User.findByIdAndUpdate(userId, {$push: {logs: {description, duration, date}}}, {new: true});

    res.json(data);
});


const listener = app.listen(process.env.PORT || 3000, () => {
    console.log('Your app is listening on port ' + listener.address().port)
})
