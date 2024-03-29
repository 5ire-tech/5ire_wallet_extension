# 5ire Wallet Extension

5ire Wallet in your browser, compatible with both Native and EVM chains.

## Building the code

The available code can be built following two ways:

* Using [Docker](https://docs.docker.com/get-docker/) and the build script provided (recommended)
* Compiling from source locally

### Using Docker and the build script

**Prerequisites**

* [Docker](https://docs.docker.com/get-docker/)
* Bash

**usage:**
`./build.sh [chrome|firefox]`

The built script is used to generate the firefox and chrome extension files by the name of `chrome-extension.tar.gz` and `firefox-extension.tar.gz`.

Use the following command to extract the archive to use it with your browser:

```
mkdir extension_build
tar -xvzf <browser-name>-extension.tar.gz -C extension_build
```

> You can set the evironment variable DEBUG to not null, then the script will print the commands that are being executed.

### Compiling from source locally

**Prerequisites**

1. [Node js v18.18.0](https://nodejs.org/en/download/)
2. 2GB RAM recommended >8GB
3. Minimum 10GB of storage
4. React js 17.0.2
5. [yarn v1.x](https://classic.yarnpkg.com/lang/en/docs/install)

Below are the steps you should follow to compile the code from source locally

* Clone the GitHub repo

```bash
git clone https://github.com/5ire-tech/5ire_wallet_extension.git
```

* Use yarn to install the required packages

```bash
yarn install
```

* Build the code for the browser of your choice

  * chrome

   ```bash
   yarn run build:chrome
   ```

  * firefox

   ```bash
   yarn run build:firefox
   ```

### Using the build

> Do remember to have extracted the `*.tar.gz` archive if you are using Docker to build the code before trying to use it.

<details> <summary>Chrome Browser</summary>

```bash
      1. Open "chrome://extensions/"
      2. Click "Developer mode"
      3. Click "Load unpacked extension…"
      4. Navigate to the extension_build folder and click "OK"
```

</details>

<details> <summary>Firefox Browser</summary>

```bash
      1. Open "about:debugging#/runtime/this-firefox"
      2. Click "Load Temporary add-on…"
      3. Navigate to "extension_build" folder
      4. Select the manifest.json file and click "OK"
```

</details>
