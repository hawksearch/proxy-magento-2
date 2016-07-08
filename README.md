# HawkSearch 
## Proxy module for Magento 2

### Installation Instructions
#### Steps to install via composer:
1. Update the “repositories” section of your sites “composer.json” file to include the repositories for the hawksearch modules:
```javascript
    "repositories": {
        "0": {
            "type": "composer",
            "url": https://repo.magento.com/
        },
        "hawksearch-datafeed": {
            "type": "git",
            "url": https://gitlab.idevdesign.net/magento2-modules/hawksearch-datafeed-2.git
        },
        "hawksearch-proxy": {
            "type": "git",
            "url": https://gitlab.idevdesign.net/magento2-modules/hawksearch-proxy-2.git
        }

    }
```
2. Update the “require” section of your sites “composer.json” file to require the hawksearch modules:
```javascript
    "require": {
        "magento/product-enterprise-edition": "2.0.7",
        [other requires…],
        "hawksearch/datafeed": "dev-master",
        "hawksearch/proxy": "dev-master"
    }
```
3. While logged in as the Magento filesystem owner, run the following commands in a command shell from your Magento 2 root installation directory (see http://devdocs.magento.com/guides/v2.1/install-gde/install-quick-ref.html for reference):
```
composer update
bin/magento module:enable –clear-static-content HawkSearch_Datafeed HawkSearch_Proxy
bin/magento setup:upgrade
bin/magento cache:clean
```
4. Login to your Magento Dashboard and configure the modules with instructions provided by your Hawksearch account manager.


#### Steps to install the hawksearch modules via zip file:
1. Open https://gitlab.idevdesign.net/magento2-modules/hawksearch-datafeed-2 and https://gitlab.idevdesign.net/magento2-modules/hawksearch-proxy-2 in a browser.
2. On each page, click the “Download zip” button to download the zip files.
3. Create a directory named “HawkSearch” in the Magento “app/code” directory and unzip the downloaded files in that directory.
4. Rename the unzipped directories to “Datafeed” and “Proxy” respectively (directories will be named hawksearch-datafeed-2.git and hawksearch-proxy.git respectively when first unzipped).
5. Ensure the files have appropriate file permissions for your installation (see http://devdocs.magento.com/guides/v2.1/install-gde/install-quick-ref.html for reference).
6. While logged in as the Magento filesystem owner, run the following commands in a command shell from your Magento 2 root installation directory
```
bin/magento module:enable –clear-static-content HawkSearch_Datafeed HawkSearch_Proxy
bin/magento setup:upgrade
bin/magento cache:clean
```
7. Login to your Magento Dashboard and configure the modules with instructions provided by your Hawksearch account manager.