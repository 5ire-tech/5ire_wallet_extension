import { HTTP_METHODS, HTTP_CONTENT_TYPE, ERROR_MESSAGES } from '../Constants'
import { isString } from '../Utility/utility'

export async function httpRequest(
  url,
  method,
  payload,
  headers = { 'Content-Type': HTTP_CONTENT_TYPE.JSON },
) {
  try {
    const reqHeader = {
      method,
      headers: headers,
    }

    if (method === HTTP_METHODS.POST)
      reqHeader.body = isString(payload) ? payload : JSON.stringify(payload)

    const res = await fetch(url, reqHeader)
    if (res.status >= 500) return { internalServer: true }
    const data = await res.json()
    return data
  } catch (err) {
    return { err: err }
  }
}

//rpc payload construction class
export class EVMRPCPayload {
  constructor(method, params = [], id = 1, jsonrpc = '2.0') {
    if (!isString(method))
      throw new Error(ERROR_MESSAGES.NOT_VALID_JSON_RPC_METHOD)
    this.method = method
    this.jsonrpc = jsonrpc
    this.params = params
    this.id = id
  }
}
