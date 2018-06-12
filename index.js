const Buffer = require('buffer').Buffer
const { CURRENCIES, TRANSACTION_TYPES, APPROVAL_CODES, TRANSACTION_ERROR_CODES, SIS_ERROR_CODES, sha256Sign, decodeResponseParameters, inputValidate } = require('./lib.js')

var config = {
  initialized: false,
  MERCHANT_SECRET_KEY: '', //base64
  SANDBOX_URL: 'https://sis-t.redsys.es:25443/sis/realizarPago',
  PRODUCTION_URL: 'https://sis.redsys.es/sis/realizarPago',
  SOAP_URL: 'https://sis-t.redsys.es:25443/sis/services/SerClsWSEntrada/wsdl/SerClsWSEntrada.wsdl'
}

exports.SOAP_URL = config.SOAP_URL
exports.SANDBOX_URL = config.SANDBOX_URL
exports.PRODUCTION_URL = config.PRODUCTION_URL
exports.sha256Sign = sha256Sign
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
  const paramsObj = inputValidate(paramsInput)
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

exports.makePaymentParametersForApi = (paramsInput) => {
  const paramsObj = inputValidate(paramsInput)
  const payload = JSON.stringify(paramsObj)
  const payloadBuffer = Buffer.from(payload)
  const Ds_MerchantParameters = payloadBuffer.toString('base64')
  const Ds_Signature = sha256Sign(config.MERCHANT_SECRET_KEY, paramsInput.orderReference, Ds_MerchantParameters)

  return {
    REQUEST: {
      DATOSENTRADA: paramsObj,
      DS_SIGNATUREVERSION: "HMAC_SHA256_V1",
      DS_SIGNATURE: Ds_Signature
    }
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

