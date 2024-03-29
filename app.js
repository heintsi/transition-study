var express = require('express')
var app = express();

app.set('port', (process.env.PORT || 5000))
app.use(express.static(__dirname + '/public', '/'))

app.get('/ping', function(request, response) {
  response.send('Hello World!')
})

app.get('/', function(req, res) {
  res.render('public/index.html')
})

app.listen(app.get('port'), function() {
  console.log("Node app is running at localhost:" + app.get('port'))
})
