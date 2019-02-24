const express = require('express')
const morgan = require('morgan')
const app = express()
const rest = require('./rest')


app.use(morgan('dev'))
app.use(express.static(__dirname + '/dist'))
app.use(rest)

app.listen(8087);