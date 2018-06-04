const Buffer = require('buffer').Buffer
const { CURRENCIES, TRANSACTION_TYPES, APPROVAL_CODES, TRANSACTION_ERROR_CODES, SIS_ERROR_CODES, sha256Sign, decodeResponseParameters } = require('./lib.js')

var config = {
  initialized: false,
  MERCHANT_SECRET_KEY: '', //base64
  SANDBOX_URL: 'https://sis-t.redsys.es:25443/sis/realizarPago',
  PRODUCTION_URL: 'https://sis.redsys.es/sis/realizarPago'
}

exports.CURRENCIES = CURRENCIES
exports.TRANSACTION_TYPES = TRANSACTION_TYPES
exports.APPROVAL_CODES = APPROVAL_CODES
exports.TRANSACTION_ERROR_CODES = TRANSACTION_ERROR_CODES
exports.SIS_ERROR_CODES = SIS_ERROR_CODES

exports.initialize = (merchantSecretKey) => {
  if (!merchantSecretKey) throw new Error("The merchant secret key is mandatory")
  config.MERCHANT_SECRET_KEY = merchantSecretKey
  config.initialized = true
}

exports.makePaymentParameters = (paramsInput) => {
  if (!paramsInput.amount) throw new Error("The amount to charge is mandatory")
  if (!paramsInput.merchantCode) throw new Error("The merchant code is mandatory")
  if (!paramsInput.transactionType) throw new Error("The transcation type is mandatory")
  if (!paramsInput.successURL) throw new Error("The successURL is mandatory")
  if (!paramsInput.errorURL) throw new Error("The errorURL is mandatory")
  if (!paramsInput.terminal) paramsInput.terminal = 1
  if (!paramsInput.currency) paramsInput.currency = CURRENCIES.EUR
  if (!paramsInput.orderReference) {
    paramsInput.orderReference = Date.now()
    console.log("Warning: no orderReference provided. Using", paramsInput.orderReference)
  }

  const paramsObj = {
    DS_MERCHANT_AMOUNT: String(paramsInput.amount),
    DS_MERCHANT_ORDER: paramsInput.orderReference,
    DS_MERCHANT_MERCHANTNAME: paramsInput.merchantName,
    DS_MERCHANT_MERCHANTCODE: paramsInput.merchantCode,
    DS_MERCHANT_CURRENCY: paramsInput.currency,
    DS_MERCHANT_TRANSACTIONTYPE: paramsInput.transactionType,
    DS_MERCHANT_TERMINAL: paramsInput.terminal,
    DS_MERCHANT_MERCHANTURL: paramsInput.merchantURL || '',
    DS_MERCHANT_URLOK: paramsInput.successURL || '',
    DS_MERCHANT_URLKO: paramsInput.errorURL || ''
  }

  if (paramsInput.DateFrecuency) paramsObj.DS_MERCHANT_DATEFRECUENCY = paramsInput.DateFrecuency
  if (paramsInput.ChargeExpiryDate) paramsObj.DS_MERCHANT_CHARGEEXPIRYDATE = paramsInput.ChargeExpiryDate
  if (paramsInput.SumTotal) paramsObj.DS_MERCHANT_SUMTOTAL = paramsInput.SumTotal
  if (paramsInput.DirectPayment) paramsObj.DS_MERCHANT_DIRECTPAYMENT = paramsInput.DirectPayment
  if (paramsInput.Identifier) paramsObj.DS_MERCHANT_IDENTIFIER = paramsInput.Identifier
  if (paramsInput.Group) paramsObj.DS_MERCHANT_GROUP = paramsInput.Group

  const payload = JSON.stringify(paramsObj)
  const payloadBuffer = Buffer.from(payload)
  const Ds_MerchantParameters = payloadBuffer.toString('base64')
  const Ds_Signature = sha256Sign(config.MERCHANT_SECRET_KEY, paramsInput.orderReference, Ds_MerchantParameters)

  return {
    Ds_SignatureVersion: "HMAC_SHA256_V1",
    Ds_MerchantParameters,
    Ds_Signature
  }
}

exports.checkResponseParameters = (strPayload, givenSignature) => {
  if (!config.initialized) throw new Error("You must initialize the component first")
  else if (!strPayload) throw new Error("The payload is required")
  else if (!givenSignature) throw new Error("The signature is required")

  const payload = decodeResponseParameters(strPayload)
  if (!payload || !payload.Ds_Order) return null // invalid response
  const Ds_Signature = sha256Sign(config.MERCHANT_SECRET_KEY, payload.Ds_Order, strPayload)

  if(Ds_Signature === givenSignature.replace('_', '/')) return payload
  else return null
}

exports.getResponseCodeMessage = (code) => {
  if (!code || typeof code !== "string") return null
  code = code.replace(/^0*/, '')
  if (Array(100).fill(0).map((val, index) => index.toString().padStart(4, '0')).includes(code)) return "Transacción autorizada para pagos y preautorizaciones"
  if (APPROVAL_CODES[code]) return APPROVAL_CODES[code]
  else if (TRANSACTION_ERROR_CODES[code]) return TRANSACTION_ERROR_CODES[code]
  else if (SIS_ERROR_CODES[code]) return SIS_ERROR_CODES[code]
  else return null
}

