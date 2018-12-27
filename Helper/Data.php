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
use Magento\Framework\App\CacheInterface;


class Data extends \Magento\Framework\App\Helper\AbstractHelper
{
    const HAWK_LANDING_PAGE_URL = 'LandingPage/';
    const CONFIG_PROXY_RESULT_TYPE = 'hawksearch_proxy/proxy/result_type';
    const CONFIG_PROXY_MODE = 'hawksearch_proxy/proxy/mode';
    const CONFIG_PROXY_SHOW_TOPTEXT = 'hawksearch_proxy/proxy/show_toptext';

    protected $_logFilename = "/var/log/hawk_sync_categories.log";
    protected $_exceptionLog = "hawk_sync_exception.log";

    protected $_logger;
    protected $_exceptionLogger;

    protected $_syncingExceptions = [];

    protected $_storeManager;
    const LP_CACHE_KEY = 'hawk_landing_pages';
    const LOCK_FILE_NAME = 'hawkcategorysync.lock';
    private $mode = null;
    private $hawkData;
    private $rawResponse;
    private $store = null;
    private $landingPages;
    protected $uri; /***overrrided CatalogSearch/Helper/Data.php***/
    private $clientIP;
    private $clientUA;
    private $_feedFilePath;
    private $isManaged;
    private $pathGenerator;
    private $filesystem;
    private $collection;
    /** @var \Magento\Framework\Logger\Monolog $logger */
    private $overwriteFlag;
    private $email_helper;
    private $collectionFactory;
    protected $session; /***overrrided CatalogSearch/Helper/Data.php***/
    private $catalogConfig;
    /**
     * @var CacheInterface
     */
    private $cache;
    /**
     * @var \Zend\Http\Client
     */
    private $zendClient;

    /**
     * Data constructor.
     * @param Context $context
     * @param StoreManagerInterface $storeManager
     * @param \Magento\CatalogUrlRewrite\Model\CategoryUrlPathGenerator $pathGenerator
     * @param \Magento\Framework\Filesystem $filesystem
     * @param \HawkSearch\Proxy\Model\ProxyEmail $email_helper
     * @param \Magento\Catalog\Model\ResourceModel\Product\CollectionFactory $collectionFactory
     * @param \Magento\Catalog\Model\Config $catalogConfig
     * @param \Magento\Catalog\Model\Session $session
     * @param CacheInterface $cache
     * @param \Zend\Http\Client $zendClient
     */
    public function __construct(
        StoreManagerInterface $storeManager,
        \Magento\CatalogUrlRewrite\Model\CategoryUrlPathGenerator $pathGenerator,
        \Magento\Framework\Filesystem $filesystem,
        \HawkSearch\Proxy\Model\ProxyEmail $email_helper,
        \Magento\Catalog\Model\ResourceModel\Product\CollectionFactory $collectionFactory,
        \Magento\Catalog\Model\Config $catalogConfig,
        \Magento\Catalog\Model\Session $session,
        CacheInterface $cache,
        \Zend\Http\Client $zendClient,
        Context $context

    ) {
        // parent construct first so scopeConfig gets set for use in "setUri", etc.
        parent::__construct($context);
        $this->_storeManager = $storeManager;
        $this->pathGenerator = $pathGenerator;
        $this->filesystem = $filesystem;
        $this->collectionFactory = $collectionFactory;
        $this->session = $session;
        $this->catalogConfig = $catalogConfig;

        $params = $context->getRequest()->getParams();
        if(is_array($params) && isset($params['q'])){
            $this->setUri($context->getRequest()->getParams());
        } else {
            $this->setUri(array('lpurl' => $context->getRequest()->getAlias('rewrite_request_path'), 'output' => 'custom', 'hawkitemlist' => 'json'));
        }
        $this->setClientIp($context->getRequest()->getClientIp());
        $this->setClientUa($context->getHttpHeader()->getHttpUserAgent());
        $this->overwriteFlag = false;
        $this->email_helper = $email_helper;

        $this->cache = $cache;
        $this->zendClient = $zendClient;
    }

    public function logException(\Exception $e)
    {
//        if (!$this->_exceptionLogger instanceof \Zend\Log\Logger) {
//            $writer = new \Zend\Log\Writer\Stream(BP . '/var/log/' . $this->_exceptionLog);
//            $this->_exceptionLogger = new \Zend\Log\Logger();
//            $this->_exceptionLogger->addWriter($writer);
//        }
//        $this->_exceptionLogger->info($e->getMessage() . ' - File: ' . $e->getFile() . ' on line ' . $e->getLine());
    }

    public function getConfigurationData($data)
    {
        $storeScope = \Magento\Store\Model\ScopeInterface::SCOPE_STORE;
        return $this->scopeConfig->getValue($data, $storeScope);

    }

    public function isValidSearchRoute($route)
    {
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

    public function setUri($args)
    {
        unset($args['ajax']);
        unset($args['json']);
        $args['output'] = 'custom';
        $args['hawkitemlist'] = 'json';
        if($this->getResultType()){
            $args['it'] = $this->getResultType();

        }
        if (isset($args['q'])) {
            unset($args['lpurl']);
            //$args['keyword'] = $args['q'];
            if(isset($args['keyword'])){
                unset($args['keyword']);
            }
        }
        $args['hawksessionid'] = $this->session->getSessionId();

        $this->uri = $this->getTrackingUrl() . '/?' . http_build_query($args);
    }

    private function fetchResponse()
    {
        if (empty($this->uri)) {
            throw new \Exception('No URI set.');
        }
        $this->zendClient->resetParameters();
        $this->zendClient->setOptions(['timeout' => 30,'useragent' => $this->clientUA ]);
        $this->zendClient->setUri($this->uri);
        $this->zendClient->setHeaders(['HTTP-TRUE-CLIENT-IP' => $this->getClientIp()]);
        $response = $this->zendClient->send();
        $this->log(sprintf('requesting url %s', $this->zendClient->getUri()));
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

    public  function getResultType() {
        return $this->getConfigurationData(self::CONFIG_PROXY_RESULT_TYPE);
    }

    public function getBaseUrl()
    {
        return $this->getConfigurationData('web/secure/base_url') . 'hawkproxy';
    }

    public function getApiUrl()
    {
        $apiUrl = $this->getConfigurationData(sprintf('hawksearch_proxy/proxy/tracking_url_%s', $this->getMode()));
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
        $trackingUrl = $this->getConfigurationData(sprintf('hawksearch_proxy/proxy/tracking_url_%s', $this->getMode()));
        if ('/' == substr($trackingUrl, -1)) {
            return $trackingUrl . 'sites/' . $this->getEngineName();
        }
        return $trackingUrl . '/sites/' . $this->getEngineName();
    }

    public function getTrackingPixelUrl($args)
    {
        $trackingUrl = $this->getConfigurationData(sprintf('hawksearch_proxy/proxy/tracking_url_%s', $this->getMode()));
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

    /**
     * @return null
     */
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

        /** @var \Magento\Catalog\Model\ResourceModel\Product\Collection $collection */
        $collection = $this->collectionFactory->create();
        $collection
            ->addAttributeToSelect($this->catalogConfig->getProductAttributes())
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
        try {
            $this->zendClient->resetParameters();
            $this->zendClient->setOptions(['timeout' => 60]);
            $this->zendClient->setUri($this->getApiUrl() . $url);
            $this->zendClient->setMethod($method);
            if (isset($data)) {
                $this->zendClient->setRawBody($data);
                $this->zendClient->setEncType('application/json');
            }
            $this->zendClient->setHeaders(['X-HawkSearch-ApiKey' => $this->getApiKey(), 'Accept' => 'application/json']);
            $this->log(sprintf('fetching request. URL: %s, Method: %s', $this->zendClient->getUri(), $method));
            $response = $this->zendClient->send();
            return $response->getBody();
        } catch (\Exception $e) {
            $this->logException($e);
            return json_encode(['Message' => "Internal Error - " . $e->getMessage()]);
        }
    }

    public function getLPCacheKey()
    {
        return self::LP_CACHE_KEY . $this->_storeManager->getStore()->getId();
    }

    public function getLandingPages()
    {
        $lp = $this->cache->load($this->getLPCacheKey());
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

    private function getLandingPageObject($name, $url, $xml, $cid, $clear = false)
    {
        $custom = '';
        if(!$clear) {
            $custom = "__mage_catid_{$cid}__";
        }
        return array(
            'PageId' => 0,
            'Name' => $name,
            'CustomUrl' => $url,
            'IsFacetOverride' => false,
            'SortFieldId' => 0,
            'SortDirection' => 'Asc',
            'SelectedFacets' => array(),
            'NarrowXml' => $xml,
            'Custom' => $custom
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

    private function createExistingCustomFieldMap($hawklist) {
        $a = [];
        foreach ($hawklist as $item) {
            if(isset($item['custom'])){
                $a[$item['custom']] = $item;
            }
        }
        return $a;
    }

    private function clearExistingCustomField($lpObject, $existingCustom){

        if(isset($existingCustom[$lpObject['Custom']]) && $existingCustom[$lpObject['Custom']]['hawkurl'] != $lpObject['CustomUrl']) {
            preg_match('/__mage_catid_(\d+)__/', $existingCustom[$lpObject['Custom']]['custom'], $matches);
            if($matches[1]){
                $otherObject = $this->getLandingPageObject(
                   $existingCustom[$lpObject['Custom']]['name'],
                   $existingCustom[$lpObject['Custom']]['hawkurl'],
                   $this->getHawkNarrowXml($matches[1]),
                   $matches[1],
                   true
                );
                $otherObject['PageId'] = $existingCustom[$lpObject['Custom']]['pageid'];
                $resp = $this->getHawkResponse(\Zend_Http_Client::PUT, self::HAWK_LANDING_PAGE_URL . $otherObject['PageId'], json_encode($otherObject));
                $this->validateHawkLandingPageResponse($resp, \Zend_Http_Client::PUT, $lpObject['CustomUrl'], json_encode($lpObject));
            }
        }
        return $lpObject['Custom'];
    }

    private function syncHawkLandingByStore(\Magento\Store\Model\Store $store)
    {

        $this->log(sprintf('Starting environment for store %s', $store->getName()));
        /** @var Mage_Core_Model_App_Emulation $appEmulation */
        $appEmulation = $this->createObj()->get('Magento\Store\Model\App\Emulation');
        $appEmulation->startEnvironmentEmulation($store->getId());
        $this->log('starting synchronizeHawkLandingPages()');
        /*
         * ok, so here is the problem, if we put or post, and some landing page already has that "custom" value, we get
         * a duplicate error: {"Message":"Duplicate Custom field"}. so lets create a new array "existingCustom" so we can
         * clear the custom value from the existing landing page. we will need to trim that function at the end of each
         * iteration so we don't end up removing custom fields we just set */

        $hawkList = $this->getHawkLandingPages();
        $existingCustom = $this->createExistingCustomFieldMap($hawkList);
        $this->log(sprintf('got %d hawk managed landing pages', count($hawkList)));

        $mageList = $this->getMagentoLandingPages();
        $this->log(sprintf('got %d magento categories', count($mageList)));

        $this->log(sprintf('got %d magento category pages', count($mageList)));

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
            $customVal = null;
            if ($sc < 0) {
                //Hawk has page Magento doesn't want managed, delete, increment left
                if (substr($hawkList[$left]['custom'], 0, strlen('__mage_catid_')) == '__mage_catid_' || $this->overwriteFlag) {
                    $resp = $this->getHawkResponse(\Zend_Http_Client::DELETE, self::HAWK_LANDING_PAGE_URL . $hawkList[$left]['pageid']);
                    $this->validateHawkLandingPageResponse($resp, \Zend_Http_Client::DELETE, $hawkList[$left]['hawkurl']);
                    $this->log(sprintf('attempt to remove page %s resulted in: %s', $hawkList[$left]['hawkurl'], $resp));
                } else {
                    $this->log(sprintf('Customer custom landing page "%s", skipping', $hawkList[$left]['hawkurl']));
                }
                $customVal = $hawkList[$left]['custom'];
                $left++;
            } elseif ($sc > 0) {
                //Mage wants it managed, but hawk doesn't know, POST and increment right
                $lpObject = $this->getLandingPageObject(
                    $mageList[$right]['name'],
                    $mageList[$right]['hawkurl'],
                    $this->getHawkNarrowXml($mageList[$right]['catid']),
                    $mageList[$right]['catid']
                );
                $customVal = $this->clearExistingCustomField($lpObject, $existingCustom);
                $resp = $this->getHawkResponse(\Zend_Http_Client::POST, self::HAWK_LANDING_PAGE_URL, json_encode($lpObject));
                $this->validateHawkLandingPageResponse($resp, \Zend_Http_Client::POST, $hawkList[$left]['hawkurl'], json_encode($lpObject));

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
                if($mageList[$right]['catid'] >= 1756 && $mageList[$right]['catid'] <= 1757) {
                    $foo = 'bar';
                }
                $lpObject['PageId'] = $hawkList[$left]['pageid'];
                $customVal = $this->clearExistingCustomField($lpObject, $existingCustom);

                $resp = $this->getHawkResponse(\Zend_Http_Client::PUT, self::HAWK_LANDING_PAGE_URL . $hawkList[$left]['pageid'], json_encode($lpObject));
                $this->validateHawkLandingPageResponse($resp, \Zend_Http_Client::PUT, $hawkList[$left]['hawkurl'], json_encode($lpObject));

                $this->log(sprintf('attempt to update page %s resulted in %s', $hawkList[$left]['hawkurl'], $resp));
                $left++;
                $right++;
            }
            if(isset($existingCustom[$customVal])){
                unset($existingCustom[$customVal]);
            }
        }

        // end emulation
        $appEmulation->stopEnvironmentEmulation();
    }

    public function synchronizeHawkLandingPages()
    {
        $stores = $this->_storeManager->getStores();
        foreach ($stores as $store) {
            /** @var \Magento\Store\Model\Store $store */
            if ($store->getConfig('hawksearch_proxy/general/enabled') && $store->isActive()) {
                try {
                    $this->syncHawkLandingByStore($store);
                } catch (\Exception $e) {
                    $this->log('-- Error: ' . $e->getMessage() . ' - File: ' . $e->getFile() . ' on line ' . $e->getLine());
                    $this->logException($e);
                    continue;
                }
            }
        }
    }

    public function getHawkLandingPages()
    {
        $hawkPages = array();
        $pages = json_decode($this->getHawkResponse(\Zend_Http_Client::GET, 'LandingPage'));
        foreach ($pages as $page) {
            if (empty($page->Custom) && ! $this->overwriteFlag)
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
            $this->_logger->info($message);
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
//        $categoryFactory = $this->createObj()->create('Magento\Catalog\Model\ResourceModel\Category\CollectionFactory');
        $collection = $this->categoryFactory->create();
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
        $filename = implode(DIRECTORY_SEPARATOR, array($path, self::LOCK_FILE_NAME));
        if (is_file($filename)) {
            $this->log('category sync lock file found, returning true');
            return true;
        }
        return false;
    }

    public function launchSyncProcess()
    {
        try {
            $this->log('-');
            $this->log('--');
            $this->log('----');
            $this->log('launching new sync process');

            //$tmppath = sys_get_temp_dir();
            $tmppath = $mediaRoot = $this->filesystem->getDirectoryWrite('tmp')->getAbsolutePath();
            $tmpfile = tempnam($tmppath, 'hawkproxy_');

            $parts = explode(DIRECTORY_SEPARATOR, __FILE__);
            array_pop($parts);
            $parts[] = 'Runsync.php';
            $runfile = implode(DIRECTORY_SEPARATOR, $parts);
            $root = BP;
            $this->log("get run file: {$runfile}");

            $this->log("going to open new shell script: $tmpfile");
            $f = fopen($tmpfile, 'w');

            $phpbin = PHP_BINDIR . DIRECTORY_SEPARATOR . "php";

            if($this->overwriteFlag) {
                $this->log("writing script: $phpbin -d memory_limit=6144M $runfile -r $root -t $tmpfile -f 1");
                fwrite($f, "$phpbin -d memory_limit=6144M $runfile -r $root -t $tmpfile -f 1\n");
            } else {
                $this->log("writing script: $phpbin -d memory_limit=6144M $runfile -r $root -t $tmpfile");
                fwrite($f, "$phpbin -d memory_limit=6144M $runfile -r $root -t $tmpfile\n");
            }

            $this->log('going to execute script');
            $syncLog = implode(DIRECTORY_SEPARATOR, [BP, 'var', 'log', $this->_exceptionLog]);
            shell_exec("/bin/sh $tmpfile > $syncLog 2>&1 &");
            $this->log('sync script launched');
            return true;
        } catch (\Exception $e) {
            $this->log('-- Error: ' . $e->getMessage() . ' - File: ' . $e->getFile() . ' on line ' . $e->getLine());
            $this->logException($e);
            return $e->getMessage();
        }

    }

    private function validateHawkLandingPageResponse($response, $action, $url, $request_raw = null)
    {
        // valid action
        if ($action == \Zend_Http_Client::PUT) {
            $act = 'Update Landing page';
        } elseif ($action == \Zend_Http_Client::POST) {
            $act = 'Create new Landing page';
        } elseif ($action == \Zend_Http_Client::DELETE) {
            $act = 'Delete Landing page';
        } else {
            $act = "Unknown action ({$action})";
        }

        // valid response
        $res = json_decode($response, true);
        if (isset($res['Message'])) {
            $this->_syncingExceptions[] = [
                'action' => $act,
                'url' => $url,
                'request_raw' => $request_raw,
                'error' => $res['Message']
            ];
        }
    }

    public function getSyncFilePath()
    {
        $this->log('getting sync lock file path');
        $relPath = $this->scopeConfig->getValue(\HawkSearch\Datafeed\Helper\Data::CONFIG_FEED_PATH);

        if(!$relPath) {
            $relPath = \HawkSearch\Datafeed\Helper\Data::DEFAULT_FEED_PATH;
        }
        $mediaRoot = $this->filesystem->getDirectoryWrite('media')->getAbsolutePath();

        if(strpos(strrev($mediaRoot), '/') !== 0) {
            $fullPath = implode(DIRECTORY_SEPARATOR, array($mediaRoot, $relPath));
        } else {
            $fullPath = $mediaRoot . $relPath;
        }

        if(!file_exists($fullPath)) {
            mkdir($fullPath, 0777, true);
        }

        return $fullPath;

    }

    public function createSyncLocks()
    {
        $this->log('going to create proxy lock file');
        $path = $this->getSyncFilePath();
        $filename = implode(DIRECTORY_SEPARATOR, array($path, self::LOCK_FILE_NAME));
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
        $filename = implode(DIRECTORY_SEPARATOR, array($path, self::LOCK_FILE_NAME));

        if (is_file($filename)) {
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

    public function setOverwriteFlag($bool) {
        $this->overwriteFlag = $bool;
    }
    public function isCronEnabled()
    {
        return $this->scopeConfig->getValue('hawksearch_proxy/sync/enabled');
    }
    public function hasExceptions()
    {
        return count($this->_syncingExceptions) > 0 ? true : false;
    }

    public function getException()
    {
        return $this->_syncingExceptions;
    }

    protected function _getEmailExtraHtml()
    {
        if ($this->hasExceptions()) {
            $limit = 50;
            $html = "<p><strong>Exception logs</strong> (limited at {$limit}):</p>";

            for ($i = 0; $i <= $limit; $i++) {
                if (isset($this->_syncingExceptions[$i])) {
                    $html .= "<p>";
                    $html .= "<strong>Category Url:</strong>" . $this->_syncingExceptions[$i]['url'] . "<br/>";
                    $html .= "<strong>Action:</strong>" . $this->_syncingExceptions[$i]['action'] . "<br/>";
                    $html .= "<strong>Request Raw Data:</strong>" . $this->_syncingExceptions[$i]['request_raw'] . "<br/>";
                    $html .= "<strong>Response Message:</strong>" . $this->_syncingExceptions[$i]['error'] . "<br/>";
                    $html .= "</p>";
                    $html .= "<hr/>";
                }
            }

            $html .= "<br/><br/><p><strong>Note*:</strong> Other synchronizing requests to HawkSearch were sent as successfully.</p>";

            return $html;
        }
        return '';
    }

    public function getEmailReceiver()
    {
        return $this->getConfigurationData('hawksearch_proxy/sync/email_notification');
    }

    public function sendStatusEmail()
    {
        if ($receiver = $this->getEmailReceiver()) {
            if ($this->hasExceptions())
                $status_text = "with some following exceptions:";
            else
                $status_text = "without any exception.";

            $extra_html = $this->_getEmailExtraHtml();

            /** @var \HawkSearch\Proxy\Model\ProxyEmail $mail_helper */
            $mail_helper = $this->email_helper;

            try {
                $mail_helper->sendEmail($receiver, [
                    'status_text' => $status_text,
                    'extra_html' => $extra_html
                ]);
                return true;
            } catch (\Exception $e) {
                $this->log('-- Error: ' . $e->getMessage() . ' - File: ' . $e->getFile() . ' on line ' . $e->getLine());
                $this->logException($e);
                return false;
            }
        }
        return true;
    }

    public function getTopText() {
        if($this->getConfigurationData(self::CONFIG_PROXY_SHOW_TOPTEXT)){
            if (empty($this->hawkData)) {
                $this->fetchResponse();
            }
            if(isset($this->hawkData->Data->TopText)) {
                return $this->hawkData->Data->TopText;
            }
        }
        return '';
    }
}
