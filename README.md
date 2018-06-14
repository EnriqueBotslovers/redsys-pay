RedSys PAY
---

NodeJS library to ease the communication with RedSys point of sales

## Installation

Install the NPM package:
```
npm install redsys-pos
```

## Usage
### Generating a request

Generate the parameters to create a transaction:

```js
const {
  initialize,
  makePaymentParameters,
  CURRENCIES,
  TRANSACTION_TYPES
} = require('redsys-pos')

const MERCHANT_KEY = "sq7HjrUOBfKmC576ILgskD5srU870gJ7" // TESTING KEY
initialize(MERCHANT_KEY)

const obj = {
  amount: '100', // cents (in euro)
  orderReference: '1508428360',
  merchantName: "INTEGRATION TEST SHOP",
  merchantCode: '327234688',
  currency: CURRENCIES.EUR,
  transactionType: TRANSACTION_TYPES.AUTHORIZATION, // '0'
  terminal: '1',
  merchantURL: 'http://shop.js.gl/merchant',
  successURL: 'http://shop.js.gl/success',
  errorURL: 'http://shop.js.gl/error'
}

const result = makePaymentParameters(obj)
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

For a detailed example, check out `example/`

Need make html same this:

```html
  <form name="from" action="https://sis-t.redsys.es:25443/sis/realizarPago" method="POST">
  <input type="hidden" name="Ds_SignatureVersion" value="HMAC_SHA256_V1" />
  <input type="hidden" name="Ds_MerchantParameters" value="eyJEU19NRVJDSEFOVF9BTU9VTlQiOiIxMDAiLCJEU19NRVJDSEFOVF9PUkRFUiI6IjE1MDg0MjgzNjAiLCJEU19NRVJDSEFOVF9NRVJDSEFOVE5BTUUiOiJUZXN0aW5nIFNob3AiLCJEU19NRVJDSEFOVF9NRVJDSEFOVENPREUiOiIzMjcyMzQ2ODgiLCJEU19NRVJDSEFOVF9DVVJSRU5DWSI6Ijk3OCIsIkRTX01FUkNIQU5UX1RSQU5TQUNUSU9OVFlQRSI6IjAiLCJEU19NRVJDSEFOVF9URVJNSU5BTCI6IjEiLCJEU19NRVJDSEFOVF9NRVJDSEFOVFVSTCI6IiIsIkRTX01FUkNIQU5UX1VSTE9LIjoiaHR0cDovL2xvY2FsaG9zdDo4MDgwL3N1Y2Nlc3MiLCJEU19NRVJDSEFOVF9VUkxLTyI6Imh0dHA6Ly9sb2NhbGhvc3Q6ODA4MC9lcnJvciJ9" />
  <input type="hidden" name="Ds_Signature" value="qkMJMWR6Dq32xwbQuguTv39OvXv4KdD1Xg7pZ8phGZI=" />
  <input type="submit" value="Go to pay">
  </form>
```

### Checking a response

```js
// Check a response
const { checkResponseParameters } = require("redsys-pos")

const merchantParams = "eyJEc19EYXRlIjoiMjAlMkYxMCUyRjIwMTciLCJEc19Ib3VyIjoiMTclM0EyMyIsIkRzX1NlY3VyZVBheW1lbnQiOiIwIiwiRHNfQW1vdW50IjoiMTAwIiwiRHNfQ3VycmVuY3kiOiI5NzgiLCJEc19PcmRlciI6IjAwMDA5NjU1RDg0IiwiRHNfTWVyY2hhbnRDb2RlIjoiMzI3MjM0Njg4IiwiRHNfVGVybWluYWwiOiIwMDEiLCJEc19SZXNwb25zZSI6Ijk5MTUiLCJEc19UcmFuc2FjdGlvblR5cGUiOiIwIiwiRHNfTWVyY2hhbnREYXRhIjoiIiwiRHNfQXV0aG9yaXNhdGlvbkNvZGUiOiIrKysrKysiLCJEc19Db25zdW1lckxhbmd1YWdlIjoiMSJ9"
const signature = "vrUsaNbxfonyn4ONUos6oosUaTBY0_SGoKDel6qsHqk="

const result = checkResponseParameters(merchantParams, signature)
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

### Checking an invalid response/signature
If an invalid response or signature is provided:

```js
// Check a response
const { checkResponseParameters } = require("redsys-pos")

const merchantParams = "eyJEc19EYXRlIjoiMjAlMkYxMCUyRjIwMTciLCJEc19Ib3VyIjoiMTclM0EyMyIsIkRzX1NlY3VyZVBheW1lbnQiOiIwIiwiRHNfQW1vdW50IjoiMTAwIiwiRHNfQ3VycmVuY3kiOiI5NzgiLCJEc19PcmRlciI6IjAwMDA5NjU1RDg0IiwiRHNfTWVyY2hhbnRDb2RlIjoiMzI3MjM0Njg4IiwiRHNfVGVybWluYWwiOiIwMDEiLCJEc19SZXNwb25zZSI6Ijk5MTUiLCJEc19UcmFuc2FjdGlvblR5cGUiOiIwIiwiRHNfTWVyY2hhbnREYXRhIjoiIiwiRHNfQXV0aG9yaXNhdGlvbkNvZGUiOiIrKysrKysiLCJEc19Db25zdW1lckxhbmd1YWdlIjoiMSJ9"
const invalidSignature = "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa="

result = checkResponseParameters(merchantParams, invalidSignature)
console.log(result)
```

This will print:

```js
null
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

### API SOAP REQUEST
Install soap client
```sh
npm i soap
```

Simple example with identifier:
```js
const {
  initialize,
  CURRENCIES,
  TRANSACTION_TYPES,
  makePaymentParametersForApi,
  SOAP_URL
} = require('redsys-pay')
const soap = require('soap')

const MERCHANT_KEY = "sq7HjrUOBfKmC576ILgskD5srU870gJ7" // TESTING KEY
initialize(MERCHANT_KEY)

const dataparams = {
  orderReference: 000123,
  amount: '100',
  merchantCode: '327234688',
  identifier: 'b0f74a4sd344Sad23E3dfdebb9d36',
  transactionType: TRANSACTION_TYPES.NO_AUTHENTICATION,
  terminal: '1',
  currency: CURRENCIES.EUR,
  expiryDate: "2012",
  merchantURL: `http://shop.js.gl/merchant`,
  directPayment: true
}

const params = makePaymentParametersWS(dataparams)

soap.createClient(SOAP_URL, (err, client) => {
  if (err) throw new Error(err)
  else {
    client.trataPeticion(params, (err2, result, rawResponse) => {
      if (err2) throw new Error(err2)
      else {
        console.log(JSON.stringify(rawResponse))
        console.log(JSON.stringify(result))
      }
    })
  }
})
```


### makePaymentParameters AND makePaymentParametersWS accepted parameters:
* amount
* orderReference
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

## About

Based [redsys-pos 0.9.0](https://github.com/TvrboPro/redsys-pos) library by Jordi Moraleda and Joel Moreno

Josep Subils updates:
- Node.js "crypto" native implementation
- Recursive payments
- Web Service parameters generator
- Add input parameters for diferent type of payments
- Add response messages
- ES2016 Code Updates
- Solve Node.js 10.x Buffer deprecations
- No external dependencies need