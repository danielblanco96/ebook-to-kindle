const express = require('express');
const path = require('path');
const fileUpload = require('express-fileupload');
const bodyParser = require('body-parser');
const cors = require('cors');
var ebookConverter = require('ebook-convert');
const fs = require('fs');

const app = express()
const port = 3000

const tmpDir = '/tmp/ebook-to-kindle/';

app.use(fileUpload());
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));


app.use(express.static(__dirname + '/views'));
app.set('view engine', 'ejs')

app.get('/', (req, res) => {
  res.render('index');
})


app.post('/book-upload', async (req, res) => {
    try {
        if(!req.files) {
            res.send({
                status: false,
                message: 'No file uploaded'
            });
        } else {
            if (!fs.existsSync(tmpDir)){
                fs.mkdirSync(tmpDir);
            }

            let book = req.files.book;
            book.mv(path.join(tmpDir, book.name));
            let bookNameWithoutExtension = book.name.split('.').slice(0, -1).join('.');
            let outputFilePath = path.join(tmpDir, bookNameWithoutExtension + '.mobi');
            let options = {
                input: path.join(tmpDir, book.name),
                output: outputFilePath
            }

            ebookConverter(options, function (err) {
                if (err) {
                    res.status(500).send(err);
                }else{
                    res.download(outputFilePath);
                }
            })
        }
    } catch (err) {
        res.status(500).send(err);
    }
});



app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})
