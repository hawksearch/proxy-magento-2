<?php
/**
 * Copyright (c) 2013 Hawksearch (www.hawksearch.com) - All Rights Reserved
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
 * IN THE SOFTWARE.
 */
namespace HawkSearch\Proxy\Helper;

use Magento\Framework\App\Helper\Context;
use Magento\Store\Model\StoreManagerInterface;

class Data extends \Magento\Framework\App\Helper\AbstractHelper
{


    protected $_storeManager;
    const LP_CACHE_KEY = 'hawk_landing_pages';
    const LOCK_FILE_NAME = 'hawkcategorysync.lock';
    private $mode = null;
    private $hawkData;
    private $rawResponse;
    private $store = null;
    private $landingPages;
    private $uri;
    private $clientIP;
    private $clientUA;
    private $_feedFilePath;
    private $isManaged;
    private $pathGenerator;

    public function __construct(Context $context,
                                StoreManagerInterface $storeManager,
                                \Magento\CatalogUrlRewrite\Model\CategoryUrlPathGenerator $pathGenerator)
    {
        // parent construct first so scopeConfig gets set for use in "setUri", etc.
        parent::__construct($context);
        $this->_storeManager = $storeManager;
        $this->pathGenerator = $pathGenerator;
        $params = $context->getRequest()->getParams();
        if(is_array($params) && isset($params['q'])){
            $this->setUri($context->getRequest()->getParams());
        } else {
            $this->setUri(array('lpurl' => $context->getRequest()->getAlias('rewrite_request_path'), 'output' => 'custom', 'hawkitemlist' => 'json'));
        }
        $this->setClientIp($context->getRequest()->getClientIp());
        $this->setClientUa($context->getHttpHeader()->getHttpUserAgent());
    }




    public function getConfigurationData($data)
    {
        $storeScope = \Magento\Store\Model\ScopeInterface::SCOPE_STORE;
        return $this->scopeConfig->getValue($data, $storeScope);

    }

    public function isValidSearchRoute($route)
    {
        // currently only checking for presence of slash
        $valid = strpos($route, '/') === false;
        $valid = $valid && $route != 'hawksearch';
        return $valid;
    }

    public function setStore($s)
    {
        $this->store = $s;
        return $this;
    }


    public function setClientIp($ip)
    {
        $this->clientIP = $ip;
    }

    public function setClientUa($ua)
    {
        $this->clientUA = $ua;
    }

    public function createObj()
    {
        return \Magento\Framework\App\ObjectManager::getInstance();
    }


    public function setUri($args)
    {

        $writer = new \Zend\Log\Writer\Stream(BP . '/var/log/testtest.log');
        $logger = new \Zend\Log\Logger();
        $logger->addWriter($writer);
        $logger->info("HAWKSEARCH: testtesttest");
        unset($args['ajax']);
        unset($args['json']);
        $args['output'] = 'custom';
        $args['hawkitemlist'] = 'json';
        if (isset($args['q'])) {
            unset($args['lpurl']);
            //$args['keyword'] = $args['q'];
            if(isset($args['keyword'])){
                unset($args['keyword']);
            }
        }
        $args['hawksessionid'] = $this->createObj()->get('Magento\Catalog\Model\Session')->getSessionId();

        $this->uri = $this->getTrackingUrl() . '/?' . http_build_query($args);
    }

    private function fetchResponse()
    {

        if (empty($this->uri)) {
            throw new \Exception('No URI set.');
        }
        $client = new \Zend_Http_Client();
        $client->setConfig(['timeout' => 30]);

        $client->setConfig(array('useragent' => $this->clientUA));
        $client->setUri($this->uri);
        $client->setHeaders('HTTP-TRUE-CLIENT-IP', $this->clientIP);
        $response = $client->request();
        $this->log(sprintf('requesting url %s', $client->getUri()));
        $this->rawResponse = $response->getBody();

        $this->hawkData = json_decode($this->rawResponse);

    }

    public function getResultData()
    {
        if (empty($this->hawkData)) {
            $this->fetchResponse();
        }
        return $this->hawkData;
    }

    public function getBaseUrl()
    {


        return $this->getConfigurationData('web/secure/base_url') . 'hawkproxy';
    }

    public function getApiUrl()
    {
        if ($this->getMode() == '1') {

            $apiUrl = $this->getConfigurationData('hawksearch_proxy/proxy/tracking_url_live');
        } else {

            $apiUrl = $this->getConfigurationData('hawksearch_proxy/proxy/tracking_url_staging');
        }
        $apiUrl = preg_replace('|^http://|', 'https://', $apiUrl);
        if ('/' == substr($apiUrl, -1)) {
            return $apiUrl . 'api/v3/';
        }
        return $apiUrl . '/api/v3/	';
    }

    public function clearHawkData()
    {
        unset($this->hawkData);
    }

    public function getLocation()
    {
        if (empty($this->hawkData)) {
            $this->fetchResponse();
        }
        return $this->hawkData->Location;
    }

    public function getFacets()
    {
        if (empty($this->hawkData)) {
            $this->fetchResponse();
        }
        return $this->hawkData->Data->Facets;
    }

    public function getTrackingUrl()
    {
        if ($this->getMode() == '1') {
            $trackingUrl = $this->getConfigurationData('hawksearch_proxy/proxy/tracking_url_live');
        } else {
            $trackingUrl = $this->getConfigurationData('hawksearch_proxy/proxy/tracking_url_staging');
        }
        if ('/' == substr($trackingUrl, -1)) {
            return $trackingUrl . 'sites/' . $this->getEngineName();
        }
        return $trackingUrl . '/sites/' . $this->getEngineName();
    }

    public function getTrackingPixelUrl($args)
    {
        if ($this->getMode() == '1') {

            $trackingUrl = $this->getConfigurationData('hawksearch_proxy/proxy/tracking_url_live');
        } else {
            $trackingUrl = $this->getConfigurationData('hawksearch_proxy/proxy/tracking_url_staging');
        }
        if ('/' == substr($trackingUrl, -1)) {
            return $trackingUrl . 'sites/_hawk/hawkconversion.aspx?' . http_build_query($args);
        }
        return $trackingUrl . '/sites/_hawk/hawkconversion.aspx?' . http_build_query($args);
    }

    public function getOrderTackingKey()
    {

        return $this->getConfigurationData('hawksearch_proxy/proxy/order_tracking_key');
    }

    public function getEngineName()
    {

        return $this->getConfigurationData('hawksearch_proxy/proxy/engine_name');
    }

    public function getMode()
    {
        if (empty($this->mode)) {


            $this->mode = $this->getConfigurationData('hawksearch_proxy/proxy/mode');
        }
        return $this->mode;
    }

    public function getApiKey()
    {

        return $this->getConfigurationData('hawksearch_proxy/proxy/hawksearch_api_key');
    }

    public function getProductCollection()
    {
        if (empty($this->hawkData)) {
            $this->fetchResponse();
        }
        $this->setIsHawkManaged(true);
        $skus = array();
        $map = array();
        $i = 0;
        $results = json_decode($this->hawkData->Data->Results);
        if (count((array)$results) == 0) {
            return null;
        }
        foreach ($results->Items as $item) {
            if (isset($item->Custom->sku)) {
                $skus[] = $item->Custom->sku;
                $map[$item->Custom->sku] = $i;
                $i++;
            }
        }

        /** @var Mage_Catalog_Model_Resource_Product_Collection $collection */
        $collection = $this->createObj()->create('Magento\Catalog\Model\ResourceModel\Product\Collection')
            ->addAttributeToSelect($this->createObj()->create('Magento\Catalog\Model\Config')->getProductAttributes())
            ->addAttributeToFilter('sku', array('in' => $skus))
            ->addMinimalPrice()
            ->addFinalPrice()
            ->addTaxPercents()
            ->addUrlRewrite();

        $sorted = array();
        if ($collection->count() > 0) {

            $it = $collection->getIterator();
            while ($it->valid()) {
                $prod = $it->current();
                $sorted[$map[trim($prod->getSku())]] = $prod;
                $it->next();
            }
            ksort($sorted);
            foreach ($sorted as $p) {
                $collection->removeItemByKey($p->getId());
                $collection->addItem($p);
            }
        }

        return $collection;
    }

    public function getHawkResponse($method, $url, $data = null)
    {
        $client = new \Zend_Http_Client();
        $client->setConfig(['timeout' => 30]);


        $client->setUri($this->getApiUrl() . $url);
        $client->setMethod($method);
        if (isset($data)) {
            $client->setRawData($data, 'application/json');
        }
        $client->setHeaders('X-HawkSearch-ApiKey', $this->getApiKey());
        $client->setHeaders('Accept', 'application/json');
        $this->log(sprintf('fetching request. URL: %s, Method: %s', $client->getUri(), $method));
        $response = $client->request();
        return $response->getBody();
    }

    public function getLPCacheKey()
    {


        return self::LP_CACHE_KEY . $this->createObj()->get('Magento\Store\Model\StoreManagerInterface')->getStore()->getId();
    }

    public function getLandingPages($force = false)
    {


        /** @var Varien_Cache_Core $cache */
        $cache = $this->createObj()->get('Magento\Framework\Cache\Core');
        $this->landingPages = json_decode($this->getHawkResponse(\Zend_Http_Client::GET, 'LandingPage/Urls'));
        sort($this->landingPages, SORT_STRING);
        // $cache->save(serialize($this->landingPages), $this->getLPCacheKey(), array(), 30);


        return $this->landingPages;
    }

    public function setIsHawkManaged($im)
    {
        $this->isManaged = $im;
    }

    public function getIsHawkManaged($path = null)
    {
        if (empty($path)) {
            return $this->isManaged;
        }

        if (substr($path, 0, 1) != '/') {
            $path = '/' . $path;
        }
        $hs = $this->getLandingPages();


        $low = 0;
        $high = count($hs) - 1;
        while ($low <= $high) {
            $p = (int)floor(($high + $low) / 2);
            $sc = strcmp($hs[$p], $path);
            if ($sc == 0) {
                $this->isManaged = true;
                return true;
            } elseif ($sc < 0) {
                $low = $p + 1;
            } else {
                $high = $p - 1;
            }
        }
        $this->isManaged = true;
        return $this->isManaged;
    }

    public function getCategoryStoreId()
    {
        $code = $this->getConfigurationData('hawksearch_proxy/proxy/store_code');

        /** @var Mage_Core_Model_Resource_Store_Collection $store */
        $store = $this->createObj()->get('Magento\Store\Model\ResourceModel\Store\Collection');
        return $store->addFieldToFilter('code', $code)->getFirstItem()->getId();

    }

    public function addLandingPage($cid)
    {


        $sid = $this->getCategoryStoreId();
        $cat = $this->createObj()->get('Magento\Catalog\Model\CategoryFactory')->setStoreId($sid)->load($cid);
        $lpObject = $this->getLandingPageObject(
            $cat->getName(),
            $this->getHawkCategoryUrl($cat),
            $this->getHawkNarrowXml($cat->getId()),
            $cid
        );

        $this->log(sprintf("going to add landing page for landing page %s with id %d", $lpObject['CustomUrl'], $cat->getId()));
        $resp = $this->getHawkResponse(\Zend_Http_Client::GET, 'LandingPage/Url/' . $lpObject['CustomUrl']);
        if (empty($resp)) {
            $this->log('getHawkResponse did not return any value for last request');
            throw new \Exception('No response from hawk, unable to proceed');
        }

        $po = json_decode($resp);
        if (isset($po->PageId)) {
            $this->log(sprintf('pageid: %d, raw resp: %s', $po->PageId, $resp));
            $lpObject['PageId'] = $po->PageId;
            $resp = $this->getHawkResponse(\Zend_Http_Client::PUT, 'LandingPage/' . $po->PageId, json_encode($lpObject));
        } else {
            $resp = $this->getHawkResponse(\Zend_Http_Client::POST, 'LandingPage/', json_encode($lpObject));
        }
        $this->log(sprintf('posted: %s', json_encode($lpObject)));
        $this->log(sprintf('response: %s', $resp));
    }

    private function getLandingPageObject($name, $url, $xml, $cid)
    {
        return array(
            'PageId' => 0,
            'Name' => $name,
            'CustomUrl' => $url,
            'IsFacetOverride' => false,
            'SortFieldId' => 0,
            'SortDirection' => 'Asc',
            'SelectedFacets' => array(),
            'NarrowXml' => $xml,
            'Custom' => "__mage_catid_{$cid}__"
        );
    }

    public function removeLandingPage($cid)
    {
        $sid = $this->getCategoryStoreId();
        $cat = $this->createObj()->get('Magento\Catalog\Model\CategoryFactory')->setStoreId($sid)->load($cid);

        $urlpath = $this->getHawkCategoryUrl($cat);
        $this->log("going to remove landing page for catid: {$cat->getId()} and url {$urlpath}");
        $res = $this->getHawkResponse(\Zend_Http_Client::DELETE, 'LandingPage/Url/' . $urlpath);
        $this->log('remove got result: ' . $res);
    }

    private function getHawkNarrowXml($id)
    {
        $xml = simplexml_load_string('<?xml version="1.0" encoding="UTF-8"?><Rule xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" RuleType="Group" Operator="All" />');
        $rules = $xml->addChild('Rules');
        $rule = $rules->addChild('Rule');
        $rule->addAttribute('RuleType', 'Eval');
        $rule->addAttribute('Operator', 'None');
        $rule->addChild('Field', 'facet:category_id');
        $rule->addChild('Condition', 'is');
        $rule->addChild('Value', $id);
        $xml->addChild('Field');
        $xml->addChild('Condition');
        $xml->addChild('Value');
        return $xml->asXML();
    }

    public function getHawkCategoryUrl(\Magento\Catalog\Model\Category $cat)
    {


        $fullUrl = $this->createObj()->get('Magento\Catalog\Helper\Category')->getCategoryUrl($cat);
        $base = $this->createObj()->get('Magento\Store\Model\StoreManagerInterface')->getStore()->getBaseUrl();
        $url = substr($fullUrl, strlen($base) - 1);
        $this->log(sprintf('full %s', $fullUrl));
        if (substr($url, 0, 1) != '/') {
            $url = '/' . $url;
        }
        return $url;
    }

    private function syncHawkLandingByStore(\Magento\Store\Model\Store $store)
    {


        $this->log(sprintf('Starting environment for store %s', $store->getName()));
        /** @var Mage_Core_Model_App_Emulation $appEmulation */
        $appEmulation = $this->createObj()->get('Magento\Store\Model\App\Emulation');
        $initialEnvironmentInfo = $appEmulation->startEnvironmentEmulation($store->getId());
        $this->log('starting synchronizeHawkLandingPages()');

        $hawkList = $this->getHawkLandingPages();

        $this->log(sprintf('got %d hawk managed landing pages', count($hawkList)));

        $mageList = $this->getMagentoLandingPages();

        usort($hawkList, function ($a, $b) {
            return strcmp($a['hawkurl'], $b['hawkurl']);
        });
        usort($mageList, function ($a, $b) {
            return strcmp($a['hawkurl'], $b['hawkurl']);
        });


        $left = 0; //hawk on the left
        $right = 0; //magento on the right
        while ($left < count($hawkList) || $right < count($mageList)) {
            if ($left >= count($hawkList)) {
                //only right left to process
                $sc = 1;
            } elseif ($right >= count($mageList)) {
                // only left left to process
                $sc = -1;
            } else {
                $sc = strcmp($hawkList[$left]['hawkurl'], $mageList[$right]['hawkurl']);
            }
            if ($sc < 0) {
                //Hawk has page Magento doesn't want managed, delete, increment left
                if (substr($hawkList[$left]['custom'], 0, strlen('__mage_catid_')) == '__mage_catid_') {
                    $resp = $this->getHawkResponse(\Zend_Http_Client::DELETE, 'LandingPage/' . $hawkList[$left]['pageid']);
                    $this->log(sprintf('attempt to remove page %s resulted in: %s', $hawkList[$left]['hawkurl'], $resp));
                } else {
                    $this->log(sprintf('Customer custom landing page "%s", skipping', $hawkList[$left]['hawkurl']));
                }
                $left++;
            } elseif ($sc > 0) {
                //Mage wants it managed, but hawk doesn't know, POST and increment right
                $lpObject = $this->getLandingPageObject(
                    $mageList[$right]['name'],
                    $mageList[$right]['hawkurl'],
                    $this->getHawkNarrowXml($mageList[$right]['catid']),
                    $mageList[$right]['catid']
                );

                $resp = $this->getHawkResponse(\Zend_Http_Client::POST, 'LandingPage/', json_encode($lpObject));
                $this->log(sprintf('attempt to add page %s resulted in: %s', $mageList[$right]['hawkurl'], $resp));
                $right++;
            } else {
                //they are the same, PUT value to cover name changes, etc. increment both sides
                $lpObject = $this->getLandingPageObject(
                    $mageList[$right]['name'],
                    $mageList[$right]['hawkurl'],
                    $this->getHawkNarrowXml($mageList[$right]['catid']),
                    $mageList[$right]['catid']
                );
                $lpObject['PageId'] = $hawkList[$left]['pageid'];
                $resp = $this->getHawkResponse(\Zend_Http_Client::PUT, 'LandingPage/' . $hawkList[$left]['pageid'], json_encode($lpObject));
                $this->log(sprintf('attempt to update page %s resulted in %s', $hawkList[$left]['hawkurl'], $resp));
                $left++;
                $right++;
            }

        }

        // end emulation
        $appEmulation->stopEnvironmentEmulation($initialEnvironmentInfo);
    }

    public function synchronizeHawkLandingPages()
    {
        try {
            /** @var Mage_Core_Model_Resource_Store_Collection $stores */
            $stores = $this->createObj()->get('Magento\Store\Model\ResourceModel\Store\Collection');
            /** @var Mage_Core_Model_Store $store */
            foreach ($stores as $store) {
                if ($this->getConfigurationData('hawksearch_proxy/general/enabled')) {
                    $this->syncHawkLandingByStore($store);
                }
            }

        } catch (Exception $e) {
            $this->log(sprintf('there has been an error: %s', $e->getMessage()));
        }
    }

    public function getHawkLandingPages()
    {
        $hawkPages = array();
        $pages = json_decode($this->getHawkResponse(\Zend_Http_Client::GET, 'LandingPage'));
        foreach ($pages as $page) {
            if (empty($page->Custom))
                continue;
            $hawkPages[] = array(
                'pageid' => $page->PageId,
                'hawkurl' => $page->CustomUrl,
                'name' => $page->Name,
                'custom' => $page->Custom
            );
        }

        return $hawkPages;
    }

    public function getMagentoLandingPages()
    {
        $this->log('getting magento landing pages...');

        /** @var Mage_Catalog_Helper_Category $helper */
        $helper = $this->createObj()->get('Magento\Catalog\Helper\Category');

        /** @var Mage_Catalog_Model_Resource_Category_Collection $categories */
        $categories = $helper->getStoreCategories(false, true, false);

        $categories->addAttributeToSelect('hawk_landing_page');
        if (!$this->getConfigurationData('hawksearch_proxy/proxy/manage_all')) {
            $categories->addAttributeToFilter('hawk_landing_page', array('eq' => '1'));
        }
        $categories->addAttributeToSort('entity_id')
            ->addAttributeToSort('parent_id')
            ->addAttributeToSort('position');

        $cats = array();
        $categories->setPageSize(1000);
        $pages = $categories->getLastPageNumber();
        $currentPage = 1;

        do {
            $categories->clear();
            $categories->setCurPage($currentPage);
            $categories->load();
            foreach ($categories as $cat) {
                $cats[] = array(
                    'hawkurl' => sprintf("/%s", $this->pathGenerator->getUrlPathWithSuffix($cat, $this->getCategoryStoreId())),
                    'name' => $cat->getName(),
                    'catid' => $cat->getId(),
                    'pid' => $cat->getParentId()
                );
            }
            $currentPage++;
        } while ($currentPage <= $pages);

        return $cats;
    }

    public function log($message)
    {
        if ($this->isLoggingEnabled()) {


            $writer = new \Zend\Log\Writer\Stream(BP . '/var/log/hawkproxy.log');
            $logger = new \Zend\Log\Logger();
            $logger->addWriter($writer);
            $logger->info("HAWKSEARCH: $message");

        }
    }

    public function getManageAll()
    {

        return $this->getConfigurationData('hawksearch_proxy/proxy/manage_all');
    }

    public function isLoggingEnabled()
    {
        return $this->getConfigurationData('hawksearch_proxy/general/logging_enabled');
    }

    public function getAjaxNotice($force = true)
    {

        /** @var Mage_Catalog_Model_Resource_Category_Collection $collection */
        $categoryFactory = $this->createObj()->create('Magento\Catalog\Model\ResourceModel\Category\CollectionFactory');
        $collection = $categoryFactory->create();
        $collection->addAttributeToFilter('parent_id', array('neq' => '0'));
        $collection->addAttributeToFilter('hawk_landing_page', array('eq' => '1'));
        $collection->addAttributeToFilter('is_active', array('neq' => '0'));
        $collection->addAttributeToFilter('display_mode', array('neq' => \Magento\Catalog\Model\Category::DM_PAGE));
        $count = $collection->count();

        $fs = '';
        if ($force) {
            $fs = " Check 'force' to remove lock and restart.";
        }
        return sprintf('<span style=\"color:red;\">Currently synchronizing %d categories.%s</span>', $count, $fs);
    }

    public function isSyncLocked()
    {
        $this->log('checking for sync lock');
        $path = $this->getSyncFilePath();
        $filename = implode(DS, array($path, self::LOCK_FILE_NAME));
        if (is_file($filename)) {
            $this->log('category sync lock file found, returning true');
            return true;
        }
        return false;
    }

    public function launchSyncProcess()
    {
        $this->log('launching new sync process');
        $tmppath = sys_get_temp_dir();
        $tmpfile = tempnam($tmppath, 'hawkproxy_');

        $parts = explode(DIRECTORY_SEPARATOR, __FILE__);
        array_pop($parts);
        $parts[] = 'Runsync.php';
        $runfile = implode(DIRECTORY_SEPARATOR, $parts);
        $root = BP;

        $this->log("going to open new shell script: $tmpfile");
        $f = fopen($tmpfile, 'w');
//        fwrite($f, '#!/bin/sh' . "\n");
        $phpbin = PHP_BINDIR . DIRECTORY_SEPARATOR . "php";

        $this->log("writing script: $phpbin -d memory_limit=6144M $runfile -r $root -t $tmpfile");
        fwrite($f, "$phpbin -d memory_limit=6144M $runfile -r $root -t $tmpfile\n");

        $this->log('going to execute script');
        $syncLog = implode(DIRECTORY_SEPARATOR, [BP, 'var', 'log', 'hawkSyncLog.log']);
        shell_exec("/bin/sh $tmpfile > $syncLog 2>&1 &");
        $this->log('sync script launched');
    }

    public function getSyncFilePath()
    {
        $this->log('getting feed file path');
        if ($this->_feedFilePath === null) {
            $this->log('path is null, checking/creating');
            $this->_feedFilePath = $this->makeVarPath(array('hawksearch', 'proxy'));
        }
        $this->log("returning feed file path: {$this->_feedFilePath}");
        return $this->_feedFilePath;
    }

    /**
     * Create path within var folder if necessary given an array of directory names
     *
     * @param array $directories
     * @return string
     */
    public function makeVarPath($directories)
    {
        $object_manager = Magento\Core\Model\ObjectManager::getInstance();
        $dir = $object_manager->get('Magento\App\Dir');
        $base = $dir->getDir(Magento\App\Dir::VAR_DIR);

        $path = $base;
        foreach ($directories as $dir) {
            $path .= DS . $dir;
            if (!is_dir($path)) {
                mkdir($path, 0777);
            }
        }
        return $path;
    }

    public function createSyncLocks()
    {
        $this->log('going to create proxy lock file');
        $path = $this->getSyncFilePath();
        $filename = implode(DS, array($path, self::LOCK_FILE_NAME));
        $content = date("Y-m-d H:i:s");

        if (file_put_contents($filename, $content) === false) {
            $this->log("Unable to write lock file, returning false!");
            return false;
        }
        return true;

    }

    public function removeSyncLocks()
    {
        $path = $this->getSyncFilePath();
        $filename = implode(DS, array($path, self::LOCK_FILE_NAME));

        if (file_exists($filename)) {
            return unlink($filename);
        }
        return false;
    }

    public function getSearchBoxes()
    {

        $sbids = explode(',', $this->getConfigurationData('hawksearch_proxy/proxy/search_box_ids'));
        foreach ($sbids as $id) {
            $id = trim($id);
        }
        return $sbids;
    }

}