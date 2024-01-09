const express = require('express');
const app = express();
const PORT = 4000;
const cors = require('cors');
const multer = require("multer");
const fs = require('fs');
const PDFParser = require('pdf-parse');
const path = require('path');
const { spawn } = require('child_process');
const User = require('./models/User');
const Chat = require('./models/chat');
const connectToDb = require('./config/dbConnect');
const dotenv = require('dotenv');
const corsConfig = require('./config/corsConfig');
const allowCredentials = require('./middleware/allowCredentials');
const verifyJWT = require('./middleware/verifyJWT');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const mkdirp = require('mkdirp');
const { findSourceMap } = require('module');

dotenv.config();
connectToDb();
app.use(express.json());
app.use(allowCredentials);
app.use(cors(corsConfig));
app.use(cookieParser());



///
app.post('/register', async (req, res) => {
    let { username, password } = req.body;
    if (!username || !password) return res.status(400).send({ 'message': 'Username and Password are required' });
    let duplicate = await User.findOne({ username });
    if (duplicate) return res.status(409).send({ 'message': `User with ${username} already exists` });
    console.log(username, password);
    try {
        const hashedPass = await bcrypt.hash(password, 10);
        const newUser = await User.create({
            username,
            password: hashedPass
        })
        // console.log(savedUser);
        res.status(201).send({ 'message': `User ${username} registered` });
    }
    catch (err) {
        res.status(500).send({ 'message': err.message });
    }
});

app.post('/login', async (req, res) => {
    let { uname, pword } = req.body;
    if (!uname || !pword) return res.status(400).send({ 'message': 'Username and Password are required' });
    const user = await User.findOne({ username: uname });
    if (!user) return res.sendStatus(401);   //unauthorized
    const match = await bcrypt.compare(pword, user.password);
    if (match) {
        const accessToken = jwt.sign(
            {
                "username": uname
            },
            process.env.ACCESS_TOKEN_SECRET,
            {
                expiresIn: '1h'
            }
        );
        const refreshToken = jwt.sign(
            { "username": uname },
            process.env.REFRESH_TOKEN_SECRET,
            { expiresIn: '1d' }
        );
        user.refreshToken = refreshToken;
        await user.save();
        // console.log(user);
        // res.send({"message":"login succesful"});
        res.cookie('jwt', refreshToken, { httpOnly: true, sameSite: 'None', secure: true, maxAge: 24 * 60 * 60 * 1000 });
        res.send({ id: user._id, accessToken });
    }
    else {
        res.sendStatus(401);
    }
})

app.get('/logout', async (req, res) => {
    const filesPath = path.join(__dirname, './files');
    const files = fs.readdirSync(filesPath);
    files.forEach((file) => {
        const filePath = path.join(filesPath, file);
        fs.unlinkSync(filePath);
    })
    const token = req.cookies?.jwt;
    // console.log(token);
    if (!token) return res.sendStatus(204);
    const user = await User.findOne({ refreshToken: token });
    // console.log(user);
    if (!user) {
        res.clearCookie('jwt', { httpOnly: true, sameSite: 'None', secure: true, maxAge: 24 * 60 * 60 * 1000 });
        return res.sendStatus(204);
    }
    user.refreshToken = '';
    await user.save();
    res.clearCookie('jwt', { httpOnly: true, sameSite: 'None', secure: true, maxAge: 24 * 60 * 60 * 1000 });
    return res.sendStatus(204);
})

///

app.use(verifyJWT);

let getQuery = (query) => {
    return new Promise((resolve, reject) => {
        let dataFromPython;
        const childpython = spawn('python', ['python.py', query])
        childpython.stdout.on('data', (data) => {
            dataFromPython = data.toString();
            console.log(`stdout: ${data}`);
        }),
            childpython.stderr.on('data', (data) => {
                console.error(`stderr: ${data}`)
            })
        childpython.on('exit', (data) => {
            resolve(dataFromPython);
        })
    })
}

app.post('/query', async (req, res) => {
    // console.log(req.body);
    const { query, fileName, id } = req.body;
    const findFile = await Chat.findOne({ filename: fileName, user: id });
    let newFile;
    if (!findFile) {
        newFile = await new Chat({
            user: id,
            filename: fileName,
            messages: [{ message: query, sender: "user" }]
        })
        await newFile.save();
    }
    if (!query) return res.status(400).send({ msg: "Query not found" });
    getQuery(query).then(async (response) => {
        console.log(response);
        if (!response) return res.send({ message: "Something went wrong with python model", sender: "bot" });
        if (findFile) {
            await findFile.messages.push({ message: query, sender: "user" });
            await findFile.messages.push({ message: response, sender: "bot" });
            await findFile.save();
        }
        else {
            await newFile.messages.push({ message: response, sender: "bot" });
            await newFile.save();
        }
        return res.send({ message: response, sender: "bot" });
    }).catch((err) => {
        console.log(err);
        return res.status(401).send({ message: "Something went wrong with python model", sender: "bot" });
    })
})

const storage = multer.diskStorage({
    destination: async function (req, file, cb) {
        cb(null, './files');
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    },
});
const upload = multer({ storage: storage });

app.post("/upload", upload.single("file"), (req, res) => {
    // console.log(req.file);
    // console.log(req.body.username);
    res.send({ fileName: req.file.filename });
})

app.get('/getMessages/:filename/:id', async (req, res) => {
    // console.log(req.params);
    const { filename, id } = req.params;
    try {
        const chat = await Chat.findOne({ filename, user: id });
        if(chat) return res.send(chat.messages);
        return res.send([]);
    }
    catch (err) {
        console.log(err);
    }
})

app.listen(PORT, () => {
    console.log(`Server is running on ${PORT}`);
})
