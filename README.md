# 5ire Wallet Extension

5ire Wallet in your browser, compatible with both Native and EVM chains.

## Prerequisites 
1. [**Node js  >v14.0**](https://nodejs.org/en/download/)
2. **2GB Ram** recommended **>8GB**
3. **Minimum 10GB of storage**
4. **React js 17.0.2**

## Steps to run service on local system
1. Clone the GitHub repo.
```bash
git clone https://github.com/5ire-tech/5ire_wallet_extension.git
```
2. Use the package manager npm or yarn to install packages.

```bash
npm install
```
3. Run this command and make a build
```bash
npm run build
```
4. Load the build 
   1. Chrome Browser
       1. In Chrome, open chrome://extensions/
       2. Click "Developer mode"
       3. Click "Load unpacked extension…"
       4. Navigate to the extension’s build folder and click "OK"

   2. Firefox Browser
       1. In Firefox, open about:debugging#/runtime/this-firefox
       2. Click "Load Temporary add-on…"
       3. Select the manifest.json file and click "OK"