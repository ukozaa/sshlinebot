var express = require('express')
var bodyParser = require('body-parser')
var app = express()
var request = require('request')
var path, node_ssh, ssh, fs

fs = require('fs')
path = require('path')
node_ssh = require('node-ssh')
ssh = new node_ssh()

app.use(bodyParser.json())

app.set('port', process.env.PORT || 4000)
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.get('/', function(req, res) {
  res.send('Hello')
})

app.listen(app.get('port'), function() {
  console.log('run at port', app.get('port'))
})

app.post('/webhook', (req, res) => {
  var text = req.body.events[0].message.text
  var sender = req.body.events[0].source.userId
  var replyToken = req.body.events[0].replyToken
  sendText(sender, text)
  res.sendStatus(200)
})

function sendText(sender, text) {
  ssh
    .connect({
      host: '27.254.96.176',
      username: 'kortv',
      privateKey: 'privatekey.pem'
    })
    .then((result, error) => {
      ssh.execCommand(text, { cwd: '/var/www' }).then(function(result) {
        console.log('STDOUT: ' + result.stdout)
        console.log('STDERR: ' + result.stderr)
        let data = {
          to: sender,
          messages: [
            {
              type: 'text',
              text: result.stdout
            }
          ]
        }
        request(
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: 'Bearer {nkWPtXe8RUijWUuM1GeZSFZ/JlTf8RfkGYrS3oFbvHmIzyBZrnS5sC2XYoZqwVEESVR+Hak9M4PgfKjy6uEvw4G8CAfmIwG84sO3W5cYzjdopkidTxkkrEwj2MseAxL6nftsugW7uZuNBoNa2ZDYiQdB04t89/1O/w1cDnyilFU=}'
            },
            url: 'https://api.line.me/v2/bot/message/push',
            method: 'POST',
            body: data,
            json: true
          },
          function(err, res, body) {
            if (err) console.log('error')
            if (res) console.log('success')
            if (body) console.log(body)
          }
        )
      })
    })
}
