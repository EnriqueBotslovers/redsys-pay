Redsys PAY
---

NodeJS library to ease the communication with RedSys point of sales

## Installation

Install the NPM package:
```
npm install redsys-pay
```

## Usage
### Generating a request

Generate the parameters to create a transaction:

```js
const {
  secretKey,
  makeParameters,
  CURRENCIES,
  TRANSACTION_TYPES
} = require('redsys-pos')

secretKey("sq7HjrUOBfKmC576ILgskD5srU870gJ7")

const obj = {
  amount: '100', // cents (in euro)
  order: '123123',
  merchantName: "REDSYS PAY SHOP",
  merchantCode: '123123123',
  currency: CURRENCIES.EUR,
  transactionType: TRANSACTION_TYPES.AUTHORIZATION, // '0'
  terminal: '1',
  merchantURL: 'http://shop.js.gl/merchant',
  successURL: 'http://shop.js.gl/success',
  errorURL: 'http://shop.js.gl/error'
}

const result = makeParameters(obj)
console.log(result);
```

The above code will print:

```js
const form_params = {
  Ds_SignatureVersion: 'HMAC_SHA256_V1',
  Ds_MerchantParameters: 'eyJEU19NRVJDSEFOVF9BTU9VTlQiOiIxMDAiLCJEU19NRVJDSEFOVF9PUkRFUiI6IjE1MDg0MjgzNjAiLCJEU19NRVJDSEFOVF9NRVJDSEFOVE5BTUUiOiJUZXN0aW5nIFNob3AiLCJEU19NRVJDSEFOVF9NRVJDSEFOVENPREUiOiIzMjcyMzQ2ODgiLCJEU19NRVJDSEFOVF9DVVJSRU5DWSI6Ijk3OCIsIkRTX01FUkNIQU5UX1RSQU5TQUNUSU9OVFlQRSI6IjAiLCJEU19NRVJDSEFOVF9URVJNSU5BTCI6IjEiLCJEU19NRVJDSEFOVF9NRVJDSEFOVFVSTCI6IiIsIkRTX01FUkNIQU5UX1VSTE9LIjoiaHR0cDovL2xvY2FsaG9zdDo4MDgwL3N1Y2Nlc3MiLCJEU19NRVJDSEFOVF9VUkxLTyI6Imh0dHA6Ly9sb2NhbGhvc3Q6ODA4MC9lcnJvciJ9',
  Ds_Signature: 'qkMJMWR6Dq32xwbQuguTv39OvXv4KdD1Xg7pZ8phGZI='
}
```
With [express.js](http://expressjs.com) you can send object to view:
```js
app.get('/form/', (req, res) => {
  const form_params = req.body
  res.render('form', form_params)
})
```

This is a [ejs](http://ejs.co) template view:

```html
<html>
<head>
  <title></title>
</head>
<body>
  <form name="from" action="https://sis-t.redsys.es:25443/sis/realizarPago" method="POST">
    <input type="hidden" name="Ds_SignatureVersion" value="<%- Ds_SignatureVersion %>" />
    <input type="hidden" name="Ds_MerchantParameters" value="<%- Ds_MerchantParameters %>" />
    <input type="hidden" name="Ds_Signature" value="<%- Ds_Signature %>" />
    <input type="submit" value="Go to pay">
  </form>
</body>
</html>
```

Need make html same this:

```html
  <form name="from" action="https://sis-t.redsys.es:25443/sis/realizarPago" method="POST">
  <input type="hidden" name="Ds_SignatureVersion" value="HMAC_SHA256_V1" />
  <input type="hidden" name="Ds_MerchantParameters" value="eyJEU19NRVJDSEFOVF9BTU9VTlQiOiIxMDAiLCJEU19NRVJDSEFOVF9PUkRFUiI6IjE1MDg0MjgzNjAiLCJEU19NRVJDSEFOVF9NRVJDSEFOVE5BTUUiOiJUZXN0aW5nIFNob3AiLCJEU19NRVJDSEFOVF9NRVJDSEFOVENPREUiOiIzMjcyMzQ2ODgiLCJEU19NRVJDSEFOVF9DVVJSRU5DWSI6Ijk3OCIsIkRTX01FUkNIQU5UX1RSQU5TQUNUSU9OVFlQRSI6IjAiLCJEU19NRVJDSEFOVF9URVJNSU5BTCI6IjEiLCJEU19NRVJDSEFOVF9NRVJDSEFOVFVSTCI6IiIsIkRTX01FUkNIQU5UX1VSTE9LIjoiaHR0cDovL2xvY2FsaG9zdDo4MDgwL3N1Y2Nlc3MiLCJEU19NRVJDSEFOVF9VUkxLTyI6Imh0dHA6Ly9sb2NhbGhvc3Q6ODA4MC9lcnJvciJ9" />
  <input type="hidden" name="Ds_Signature" value="qkMJMWR6Dq32xwbQuguTv39OvXv4KdD1Xg7pZ8phGZI=" />
  <input type="submit" value="Go to pay">
  </form>
```

### Get a response parameters

```js
const { getResponseParameters } = require("redsys-pos")

const RESPONSE = req.body.Ds_MerchantParameters
const result = getResponseParameters(RESPONSE)
console.log(result)
```

If successful, this will print:

```js
{
  Ds_Date: '20%2F10%2F2017',
  Ds_Hour: '18%3A20',
  Ds_SecurePayment: '1',
  Ds_Amount: '100',
  Ds_Currency: '978',
  Ds_Order: '00007921799',
  Ds_MerchantCode: '327234688',
  Ds_Terminal: '001',
  Ds_Response: '0000',
  Ds_TransactionType: '0',
  Ds_MerchantData: '',
  Ds_AuthorisationCode: '678746',
  Ds_ConsumerLanguage: '1',
  Ds_Card_Country: '724',
  Ds_Card_Brand: '1'
}
```

### Checking a response code

```js
const { getResponseCodeMessage } = require("redsys-pos")

var str = getResponseCodeMessage("0180")
console.log(str)
```

This will print:

```
Operación no permitida para ese tipo de tarjeta.
```

### Checking an invalid response code

```js
const { getResponseCodeMessage } = require("redsys-pos")

var str = getResponseCodeMessage("xyz")
console.log(str)
```

This will print:

```
null
```

### API SOAP WebService request
Install soap client
```sh
npm i soap
```

Recurrent payment with SOAP:
```js
const {
  secretKey,
  CURRENCIES,
  TRANSACTION_TYPES,
  makeWSParameters,
  SANDBOX_WS
} = require('redsys-pay')
const soap = require('soap')

secretKey("sq7HjrUOBfKmC576ILgskD5srU870gJ7")

const params = {
  amount: '100', // cents (in euro)
  order: '000123',
  merchantCode: '132132132',
  currency: CURRENCIES.EUR,
  expiryDate: "2012",
  transactionType: TRANSACTION_TYPES.NO_AUTHENTICATION,
  terminal: '1',
  identifier: '18550bc2358294ddfdb50f74d149a31eecebb9d36'
}

const params = makeWSParameters(dataparams)

soap.createClient(SANDBOX_WS, (err, client) => {
  if (err) throw new Error(err)
  else {
    client.trataPeticion({ _xml: params }, (err2, result, rawResponse) => {
      if (err2) throw new Error(err2)
      else {
        console.log(JSON.stringify(rawResponse))
        console.log(JSON.stringify(result))
      }
    })
  }
})
```


### makeParameters AND makeWSParameters accepted parameters:
* amount
* order
* merchantCode
* currency
* transactionType
* terminal
* merchantName
* merchantURL
* errorURL
* successURL
* dateFrecuency
* chargeExpiryDate
* sumTotal
* directPayment
* identifier
* group
* pan
* expiryDate
* CVV2
* partialPayment
* cardCountry
* merchantData
* clientIp

### Transaction Types:
* AUTHORIZATION: "0"
* PRE_AUTHORIZATION: "1"
* CONFIRMATION: "2"
* AUTO_REFUND: "3"
* RECURRING_TRANSACTION: "5"
* SUCCESSIVE_TRANSACTION: "6"
* PRE_AUTHENTICATION: "7"
* PRE_AUTHENTICATION_CONFIRMATION: "8"
* PRE_AUTHORIZATION_CANCEL: "9"
* DEFERRED_AUTHORIZATION: "O"
* DEFERRED_AUTHORIZATION_CONFIRMATION: "P"
* DEFERRED_AUTHORIZATION_CANCEL: "Q"
* DEFERRED_INITIAL_FEE: "R"
* DEFERRED_SUCCESSIVE_FEE: "S"
* NO_AUTHENTICATION: "A"
* DELETE_REFERENCE: "44"

### Currencies available:
* EUR: "978"
* USD: "840"
* GBP: "826"
* JPY: "392"
* RUB: "643"

### Obtain services location:
```js
const {
  SANDBOX_URL,
  PRODUCTION_URL,
  SANDBOX_WS,
  PRODUCTION_WS
} = require('redsys-pay')
```

## About

Based [redsys-pos 0.9.0](https://github.com/TvrboPro/redsys-pos) library by Jordi Moraleda and Joel Moreno
[redsys-pay](https://github.com/warlock/redsys-pay) library by Josep Subils

Josep Subils updates:
- Node.js "crypto" native implementation
- Recursive payments
- Web Service parameters generator
- Add input parameters for diferent type of payments
- Add response messages
- ES2016 Code Updates
- Solve Node.js 10.x Buffer deprecations
- No external dependencies need
- Correct XML generation for Redsys SOAP compatiblity

Carlos Asín @carlosasin updates:
- Include DS_MERCHANT_CONSUMERLANGUAGE param

@dlopesino update:
- Add Bizum parameter

@gianbuono update:
- Fixed regex