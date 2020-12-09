# HawkSearch 
## Proxy module for Magento 2

### Installation Instructions
#### Steps to install via composer:
1. Update the “repositories” section of your sites “composer.json” file to include the repositories for the hawksearch modules:
```javascript
    "repositories": {
        "0": {
            "type": "composer",
            "url": "https://repo.magento.com/"
        },
        "hawksearch.connector": {
            "type": "git",
             "url": "git@github.com:hawksearch/connector-magento-2.git"
        },
        "hawksearch.proxy": {
            "type": "git",
            "url": "git@github.com:hawksearch/proxy-magento-2.git"
        }
    }
```
OR by using composer commands directly:
```bash
    composer config repositories.hawksearch.connector git git@github.com:hawksearch/connector-magento-2.git
    composer config repositories.hawksearch.proxy git git@github.com:hawksearch/proxy-magento-2.git
```
2. Use composer to install the module:
```
composer require --no-upate hawksearch/connector hawksearch/proxy
composer update
```
3. Complete your deployment process as usual (minimally "bin/magento setup:upgrade", see http://devdocs.magento.com/guides/v2.1/install-gde/install-quick-ref.html for reference).
4. Login to your Magento Dashboard and configure the modules with instructions provided by your Hawksearch account manager.


#### Steps to install the HawkSearch modules via zip file:
1. Open https://github.com/hawksearch/connector-magento-2 and https://github.com/hawksearch/proxy-magento-2 in a browser.
2. On each page, click the “Download zip” button to download the zip files.
3. Create a directory named “HawkSearch” in the Magento “app/code” directory and unzip the downloaded files in that directory.
4. Rename the unzipped directories to “Datafeed” and “Proxy” respectively.
5. Ensure the files have appropriate file permissions for your installation (see http://devdocs.magento.com/guides/v2.1/install-gde/install-quick-ref.html for reference).
6. While logged in as the Magento filesystem owner, run the following commands in a command shell from your Magento 2 root installation directory
```
bin/magento module:enable –clear-static-content HawkSearch_Connector HawkSearch_Proxy
bin/magento setup:upgrade
bin/magento cache:clean
```
7. Login to your Magento Dashboard and configure the modules with instructions provided by your Hawksearch account manager.
