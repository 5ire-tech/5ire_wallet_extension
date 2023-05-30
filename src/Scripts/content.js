import Browser from 'webextension-polyfill'
import { WindowPostMessageStream } from './stream'
import { CONTENT_SCRIPT, INPAGE } from './constants'
import { isManifestV3 } from './utils'
const contentStream = new WindowPostMessageStream({
  name: CONTENT_SCRIPT,
  target: INPAGE,
})

// console.log("here is window object: ", window);

contentStream.on('data', async (data) => {
  // console.log("here is data in content: ", data);

  try {
    switch (data.method) {
      case 'request':
        contentStream.write({
          id: data.id,
          response: 'I return back result to you',
          error: null,
        })
        break
      case 'connect':
      case 'eth_requestAccounts':
      case 'eth_accounts':
      case 'disconnect':
        Browser.runtime.sendMessage(data)
        break

      case 'eth_sendTransaction':
        if (data.method !== 'eth_sendTransaction' || data.message?.length < 0) {
          contentStream.write({
            id: data.id,
            error: 'Invalid Transaction Request',
          })
        } else {
          Browser.runtime.sendMessage(data)
        }
        break
      case 'get_endPoint':
      case 'native_add_nominator':
      case 'native_renominate':
      case 'native_nominator_payout':
      case 'native_validator_payout':
      case 'native_stop_validator':
      case 'native_stop_nominator':
      case 'native_unbond_validator':
      case 'native_unbond_nominator':
      case 'native_withdraw_nominator':
      case 'native_withdraw_validator':
      case 'native_withdraw_nominator_unbonded':
      case 'native_withdraw_validator_unbonded':
      case 'native_add_validator':
      case 'native_validator_bondmore':
      case 'native_restart_validator':
      case 'native_nominator_bondmore':
        Browser.runtime.sendMessage(data)
        break
      case 'keepAlive':
        setTimeout(() => {
          contentStream.write({
            method: 'keepAlive',
          })
        }, 1000 * 30)
        break
      default:
        contentStream.write({
          id: data.id,
          error: 'Invalid request method',
        })
    }
  } catch (err) {
    console.log('Error under content script', err)
  }
})

const messageFromExtensionUI = (message, sender, cb) => {
  if (message?.id) {
    contentStream.write(message)
    cb('I Recevie and ack')
  }
}

/**
 * Fired when a message is sent from either an extension process or a content script.
 */
Browser.runtime.onMessage.addListener(messageFromExtensionUI)

// These require calls need to use require to be statically recognized by browserify
// const path = require('path');

function injectScript() {
  try {
    const container = document.head || document.documentElement
    const scriptTag = document.createElement('script')
    scriptTag.setAttribute('async', 'false')
    // scriptTag.textContent = content;
    scriptTag.setAttribute(
      'src',
      Browser.runtime.getURL('static/js/injected.js'),
    )

    container.insertBefore(scriptTag, container.children[0])
    container.removeChild(scriptTag)
  } catch (error) {
    console.error('5ire: Provider injection failed.', error)
  }
}

if (!isManifestV3) {
  injectScript()
}
