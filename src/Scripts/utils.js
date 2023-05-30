import Browser from 'webextension-polyfill'

export const getBaseUrl = (url) => {
  const pathArray = url.split('/')
  const protocol = pathArray[0]
  const host = pathArray[2]
  return protocol + '//' + host
}
export const getCurrentTabUrl = (callback) => {
  const queryInfo = { active: true, currentWindow: true }

  Browser.tabs.query(queryInfo).then((tabs) => {
    callback(getBaseUrl(tabs[0]?.url))
  })
}

export const getCurrentTabUId = (callback) => {
  const queryInfo = { active: true, currentWindow: true }

  Browser.tabs.query(queryInfo).then((tabs) => {
    callback(tabs[0].id)
  })
}

export const isManifestV3 = Browser.runtime.getManifest().manifest_version === 3
