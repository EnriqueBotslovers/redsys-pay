const Buffer = require('buffer').Buffer
const xml = require('xml')
const { CURRENCIES, TRANSACTION_TYPES, APPROVAL_CODES, TRANSACTION_ERROR_CODES, SIS_ERROR_CODES, sha256Sign, inputValidate } = require('./lib.js')

var config = {
  initialized: false,
  MERCHANT_SECRET_KEY: '', //base64
  SANDBOX_URL: 'https://sis-t.redsys.es:25443/sis/realizarPago',
  PRODUCTION_URL: 'https://sis.redsys.es/sis/realizarPago',
  SANDBOX_OPERATIONS: 'https://sis-t.redsys.es:25443/sis/operaciones',
  PRODUCTION_OPERATIONS: 'https://sis.redsys.es/sis/operaciones',
  SANDBOX_WS: 'https://sis-t.redsys.es:25443/sis/services/SerClsWSEntrada/wsdl/SerClsWSEntrada.wsdl',
  PRODUCTION_WS: 'https://sis.redsys.es/sis/services/SerClsWSEntrada/wsdl/SerClsWSEntrada.wsdl'
}

exports.SANDBOX_URL = config.SANDBOX_URL
exports.PRODUCTION_URL = config.PRODUCTION_URL
exports.SANDBOX_WS = config.SANDBOX_WS
exports.PRODUCTION_WS = config.PRODUCTION_WS
exports.sha256Sign = sha256Sign
exports.CURRENCIES = CURRENCIES
exports.TRANSACTION_TYPES = TRANSACTION_TYPES
exports.APPROVAL_CODES = APPROVAL_CODES
exports.TRANSACTION_ERROR_CODES = TRANSACTION_ERROR_CODES
exports.SIS_ERROR_CODES = SIS_ERROR_CODES

exports.secretKey = (merchantSecretKey) => {
  if (!merchantSecretKey) throw new Error("The merchant secret key is mandatory")
  config.MERCHANT_SECRET_KEY = merchantSecretKey
  config.initialized = true
}

exports.makeParameters = (paramsInput) => {
  const paramsObj = inputValidate(paramsInput)
  const payload = JSON.stringify(paramsObj)
  const payloadBuffer = Buffer.from(payload)
  const Ds_MerchantParameters = payloadBuffer.toString('base64')
  const Ds_Signature = sha256Sign(config.MERCHANT_SECRET_KEY, paramsInput.order, Ds_MerchantParameters)
  return { Ds_SignatureVersion: "HMAC_SHA256_V1", Ds_MerchantParameters, Ds_Signature }
}

exports.makeWSParameters = (paramsInput) => {
  const paramsObj = inputValidate(paramsInput)
  const paramsData = Object.keys(paramsObj).map((x) => {
    const d =  {}
    d[x] = paramsObj[x]
    return d
  })
  const datosEntrada = { DATOSENTRADA: paramsData }
  const payload = xml(datosEntrada)
  const Ds_MerchantParameters = payload.toString('base64')
  const Ds_Signature = sha256Sign(config.MERCHANT_SECRET_KEY, paramsInput.order, Ds_MerchantParameters)
  const data = {
    REQUEST: [
      datosEntrada,
      { DS_SIGNATUREVERSION: "HMAC_SHA256_V1" },
      { DS_SIGNATURE: Ds_Signature }
    ]
  }
  return  `<trataPeticion><datoEntrada><![CDATA[${xml(data)}]]></datoEntrada></trataPeticion>`
}

exports.getResponseParameters = (strPayload) => {
  if (!strPayload) throw new Error("The payload is required")
  if (typeof strPayload != "string") throw new Error("Payload must be a base-64 encoded string")
  const deserial = Buffer.from(strPayload, 'base64')
  const ascii = deserial.toString('ascii')
  const payload = JSON.parse(ascii)
  if (!payload || !payload.Ds_Order) return null // invalid response
  else return payload
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

