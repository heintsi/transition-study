var express = require('express')
var exphbs = require('express-handlebars')
var app = express()

app.set('port', (process.env.PORT || 5000))

app.engine('.hbs', exphbs({ extname: '.hbs'} ))
app.set('view engine', '.hbs')

app.use(express.static(__dirname + '/public', '/'))

app.get('/ping', function(request, response) {
  response.send('Hello World!')
})

app.get('/', function(req, res) {
  res.render('public/index.html')
})

app.get('/stores', function(req, res) {
  res.render('store', {
    animation: false,
    imagesPageOne: [
      {imageSrc: 'images/img11.jpg'},
      {imageSrc: 'images/img12.jpg'},
      {imageSrc: 'images/img13.jpg'},
      {imageSrc: 'images/img14.jpg'},
      {imageSrc: 'images/img15.jpg'},
      {imageSrc: 'images/img16.jpg'},
      {imageSrc: 'images/img17.jpg'},
      {imageSrc: 'images/img18.jpg'},
      {imageSrc: 'images/img19.jpg'},
    ],
    imagesPageTwo: [
      {imageSrc: 'images/img21.jpg'},
      {imageSrc: 'images/img22.jpg'},
      {imageSrc: 'images/img23.jpg'},
      {imageSrc: 'images/img24.jpg'},
      {imageSrc: 'images/img25.jpg'},
      {imageSrc: 'images/img26.jpg'},
      {imageSrc: 'images/img27.jpg'},
      {imageSrc: 'images/img28.jpg'},
      {imageSrc: 'images/img29.jpg'},
    ]
  })
})

app.listen(app.get('port'), function() {
  console.log("Node app is running at localhost:" + app.get('port'))
})
