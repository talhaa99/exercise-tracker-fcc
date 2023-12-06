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
    username: String
});

const User = mongoose.model('User', userSchema);

const logSchema = new mongoose.Schema({
    userId: mongoose.Schema.Types.ObjectId,
    description: String,
    duration: String,
    date: String,
});

const Log = mongoose.model('Log', logSchema);

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
    } else {
        date = new Date(date).toDateString();
    }

    const user = await User.findOne({_id: userId});
    await Log.create({userId, description, duration, date});

    res.json({_id: userId, username: user.username, description, duration, date});
});

app.get('/api/users/:_id/logs', async (req, res) => {

    let userId = req.params._id;

    const user = await User.findOne({_id: userId}).lean();
    const data = await Log.find({userId}).lean();

    user.count = data.length;
    user.log = data;

    res.json(user);
});

const listener = app.listen(process.env.PORT || 3000, () => {
    console.log('Your app is listening on port ' + listener.address().port)
})
