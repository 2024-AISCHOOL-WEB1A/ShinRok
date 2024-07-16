const express = require('express')
const router = express.Router()
const conn = require('../config/db')
const s3 = require('../config/aws')

// 게시판 관련 기능

module.exports = router