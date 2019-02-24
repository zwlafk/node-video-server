const sha1 = require('js-sha1');
const request = require('request');
const cache = require('memory-cache');
let access_token = ""
let jsapi_ticket = ""
const expire_time = 7199999
const getAccessToken = (req, res, next) => {
  const { query: { corpsecret, corpid, url } } = req

  let access_token_cache = cache.get(corpsecret)

  if (access_token_cache) {
    console.log(access_token_cache, 'access_token_cache')
    access_token = access_token_cache
    next()
  } else {
    request('https://qyapi.weixin.qq.com/cgi-bin/gettoken',
      {
        qs: {
          corpid,
          corpsecret
        }
      },
      (error, response, body) => {
        console.log("***********getAccessToken middle**********")

        let info = JSON.parse(body)
        access_token = info.access_token

        cache.put(corpsecret, access_token, expire_time);

        next()
      });
  }
}

const getJsapiToken = (req, res, next) => {
  let jsapi_ticket_cache = cache.get(access_token)

  if (jsapi_ticket_cache) {
    console.log(jsapi_ticket_cache, 'jsapi_ticket_cache')
    jsapi_ticket = jsapi_ticket_cache
    next()
  } else {
    request('https://qyapi.weixin.qq.com/cgi-bin/get_jsapi_ticket',
      {
        qs: {
          access_token
        }
      },
      (error, response, body) => {
        console.log("***********getJsapiToken middle**********")


        let info = JSON.parse(body)
        jsapi_ticket = info.ticket
        cache.put(access_token, jsapi_ticket, expire_time);

        next()
      });
  }
}

const getSignature = (req, res) => {

  const { query: { url } } = req

  let noncestr = "test"

  let timestamp = new Date().getTime()


  let string1 = `jsapi_ticket=${jsapi_ticket}&noncestr=${noncestr}&timestamp=${timestamp}&url=${url}`

  let signature = sha1(string1)

  let resObj = {
    signature, timestamp, nonceStr: noncestr
  }



  let data = { data: resObj }
  console.log(new Date().getHours() + ':' + new Date().getMinutes())
  console.log("*********** end **********")
  return res.send(data)
}
exports.getAccessToken = getAccessToken
exports.getJsapiToken = getJsapiToken
exports.getSignature = getSignature