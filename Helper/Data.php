<?php
/**
 * Copyright (c) 2018 Hawksearch (www.hawksearch.com) - All Rights Reserved
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

use HawkSearch\Proxy\Model\ProxyEmailFactory;
use Magento\Catalog\Model\Config;
use Magento\Catalog\Model\ResourceModel\Product\CollectionFactory;
use Magento\Catalog\Model\SessionFactory;
use Magento\Framework\App\CacheInterface as Cache;
use Magento\Framework\App\Helper\Context;
use Magento\Framework\Filesystem;
use Magento\Store\Model\App\Emulation;
use Magento\Store\Model\ResourceModel\Store\CollectionFactory as StoreCollectionFactory;
use Magento\Store\Model\ScopeInterface;
use Magento\Store\Model\Store;
use Magento\Store\Model\StoreManagerInterface;
use Magento\Catalog\Model\ResourceModel\Category\CollectionFactory as CategoryCollectionFactory;

class Data extends \Magento\Framework\App\Helper\AbstractHelper
{
    const HAWK_LANDING_PAGE_URL = 'LandingPage/';
    const CONFIG_PROXY_ENABLED = 'hawksearch_proxy/general/enabled';
    const CONFIG_PROXY_MANAGE_SEARCH = 'hawksearch_proxy/proxy/manage_search';
    const CONFIG_PROXY_MANAGE_CATEGORIES = 'hawksearch_proxy/proxy/manage_categories';

    const CONFIG_PROXY_RESULT_TYPE = 'hawksearch_proxy/proxy/result_type';
    const CONFIG_PROXY_ENABLE_CUSTOM_SEARCH_ROUTE = 'hawksearch_proxy/proxy/enable_custom_search_route';
    const CONFIG_PROXY_ENABLE_LANDING_PAGE_ROUTE = 'hawksearch_proxy/proxy/enable_hawk_landing_pages';
    const CONFIG_PROXY_CATEGORY_SYNC_CRON_ENABLED = 'hawksearch_proxy/sync/enabled';
    const CONFIG_PROXY_SHOWTABS = 'hawksearch_proxy/proxy/show_tabs';
    const CONFIG_PROXY_MODE = 'hawksearch_proxy/proxy/mode';
    const CONFIG_PROXY_TYPE_LABEL = 'hawksearch_proxy/proxy/type_label';
    const CONFIG_PROXY_SHOW_TYPE_LABELS = 'hawksearch_proxy/proxy/show_type_labels';

    const LP_CACHE_KEY = 'hawk_landing_pages';
    const LOCK_FILE_NAME = 'hawkcategorysync.lock';
    const CONFIG_PROXY_META_ROBOTS = 'hawksearch_proxy/proxy/meta_robots';

    protected $_syncingExceptions = [];

    protected $storeManager;
    private $hawkData;
    private $rawResponse;
    private $store = null;
    private $landingPages;
    protected $uri;
    /***overrrided CatalogSearch/Helper/Data.php***/
    private $clientIP;
    private $clientUA;
    private $isManaged;
    private $filesystem;
    /** @var \Magento\Framework\Logger\Monolog $logger */
    private $overwriteFlag;
    private $email_helper;
    private $collectionFactory;
    protected $session;
    /***overrrided CatalogSearch/Helper/Data.php***/
    private $catalogConfig;
    /**
     * @var CategoryCollectionFactory
     */
    private $categoryCollectionFactory;
    /**
     * @var Emulation
     */
    private $emulation;
    /**
     * @var StoreCollectionFactory
     */
    private $storeCollectionFactory;
    /**
     * @var Cache
     */
    private $cache;
    private $urlFinder;

    /**
     * Data constructor.
     * @param Context $context
     * @param StoreManagerInterface $storeManager
     * @param Filesystem $filesystem
     * @param ProxyEmailFactory $email_helper
     * @param CollectionFactory $collectionFactory
     * @param CategoryCollectionFactory $categoryCollectionFactory
     * @param Config $catalogConfig
     * @param Emulation $emulation
     * @param StoreCollectionFactory $storeCollectionFactory
     * @param Cache $cache
     * @param SessionFactory $session
     * @param \Magento\UrlRewrite\Model\UrlFinderInterface $urlFinder
     */
    public function __construct(
        Context $context,
        StoreManagerInterface $storeManager,
        Filesystem $filesystem,
        ProxyEmailFactory $email_helper,
        CollectionFactory $collectionFactory,
        CategoryCollectionFactory $categoryCollectionFactory,
        Config $catalogConfig,
        Emulation $emulation,
        StoreCollectionFactory $storeCollectionFactory,
        Cache $cache,
        SessionFactory $session,
        \Magento\UrlRewrite\Model\UrlFinderInterface $urlFinder
    )
    {
        // parent construct first so scopeConfig gets set for use in "setUri", etc.
        parent::__construct($context);
        $this->storeManager = $storeManager;
        $this->filesystem = $filesystem;
        $this->collectionFactory = $collectionFactory;
        $this->session = $session;
        $this->catalogConfig = $catalogConfig;

        $this->overwriteFlag = false;
        $this->email_helper = $email_helper;

        $this->categoryCollectionFactory = $categoryCollectionFactory;
        $this->emulation = $emulation;
        $this->storeCollectionFactory = $storeCollectionFactory;
        $this->cache = $cache;
        $this->urlFinder = $urlFinder;
    }

    public function getConfigurationData($data)
    {
        $storeScope = ScopeInterface::SCOPE_STORE;

        return $this->scopeConfig->getValue($data, $storeScope, $this->storeManager->getStore()->getCode());
    }

    public function isManageSearch()
    {
        return
            $this->scopeConfig->getValue(self::CONFIG_PROXY_ENABLED, ScopeInterface::SCOPE_STORE)
            &&
            $this->scopeConfig->getValue(self::CONFIG_PROXY_MANAGE_SEARCH, ScopeInterface::SCOPE_STORE);
    }

    public function isManageCategories()
    {
        return
            $this->scopeConfig->getValue(self::CONFIG_PROXY_ENABLED, ScopeInterface::SCOPE_STORE)
            &&
            $this->scopeConfig->getValue(self::CONFIG_PROXY_MANAGE_CATEGORIES, ScopeInterface::SCOPE_STORE);
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

    public function buildUri()
    {
        $controller = implode('_', [$this->_request->getModuleName(), $this->_request->getControllerName()]);
        $params = $this->_request->getParams();
        switch ($controller) {
            case 'hawkproxy_landingPage':
                if ($this->getConfigurationData('hawksearch_proxy/proxy/enable_hawk_landing_pages')) {
                    $params['lpurl'] = $this->_request->getAlias('rewrite_request_path');
                    $this->setUri($params);
                }
                break;
            case 'catalog_category':
                if ($this->getConfigurationData('hawksearch_proxy/proxy/manage_categories')) {
                    if(empty($params['lpurl'])){
                        $params['lpurl'] = $this->_request->getAlias('rewrite_request_path');
                    }
                    $this->setUri($params);
                }
                break;
            case 'catalogsearch_result':
                if ($this->getConfigurationData('hawksearch_proxy/proxy/manage_search')) {
                    $this->setUri($params);
                }
                break;
            case 'hawkproxy_index':

                if (isset($params['lpurl']) && (substr($params['lpurl'], 0, strlen('/catalogsearch/result')) === '/catalogsearch/result')) {
                    unset($params['lpurl']);
                }
                $this->setUri($params);
                break;
            default:
                $this->setUri($params);
        }
    }

    public function setUri($args)
    {
        unset($args['ajax']);
        unset($args['json']);
        $args['output'] = 'custom';
        $args['hawkitemlist'] = 'json';
        $args['hawkfeatured'] = 'json';
        if ($this->getShowTabs()) {
            $args['hawktabs'] = 'html';
        }
        if (empty($args['it']) && $this->getResultType()) {
            $args['it'] = $this->getResultType();
        }
        if (isset($args['keyword'])) {
            unset($args['keyword']);
        }
        $session = $this->session->create();
        $sid = $session->getHawkSessionId();
        if (!$sid) {
            $sid = $session->getSessionId();
            $session->setHawkSessionId($sid);
        }
        $args['HawkSessionId'] = $sid;
        if (isset($args['lpurl']) && (!$this->getIsHawkManaged($args['lpurl']) || $args['lpurl'] == '/catalogsearch/result/')) {
            unset($args['lpurl']);
        }

        $this->uri = $this->getTrackingUrl() . '/?' . http_build_query($args);
    }

    private function fetchResponse()
    {
        if (empty($this->uri)) {
            $this->buildUri();
            $this->setClientIp($this->_request->getClientIp());
            $this->setClientUa($this->_httpHeader->getHttpUserAgent());
        }
        $client = new \Zend_Http_Client();
        $client->setConfig(['timeout' => 30]);

        $client->setConfig(array('useragent' => $this->clientUA));
        $client->setUri($this->uri);
        $client->setHeaders('HTTP-TRUE-CLIENT-IP', $this->clientIP);
        $response = $client->request();
        if ($response->getStatus() == '500') {
            throw new \Exception($response->getMessage());
        }
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

    public function getResultType()
    {
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
        return $apiUrl . '/api/v3/';
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

    public function getTrackingDataHtml()
    {
        if (empty($this->hawkData)) {
            $this->fetchResponse();
        }
        $counter = 1;
        $obj = array();
        $productCollection = $this->getProductCollection();
        if ($productCollection instanceof \Magento\Catalog\Model\ResourceModel\Product\Collection) {
            foreach ($productCollection as $item) {
                $obj[] = ['url' => $item->getProductUrl(), 'tid' => $this->hawkData->TrackingId, 'sku' => $item->getSku(), 'i' => $counter++];
            }
            return sprintf('<div id="hawktrackingdata" style="display:none;" data-tracking="%s"></div>', htmlspecialchars(json_encode($obj, JSON_UNESCAPED_SLASHES), ENT_QUOTES));
        }
        return '<div id="hawktrackingdata" style="display:none;" data-tracking="[]"></div>';
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
        return $this->getConfigurationData(self::CONFIG_PROXY_MODE);
    }

    public function getApiKey()
    {
        return $this->getConfigurationData('hawksearch_proxy/proxy/hawksearch_api_key');
    }

    /**
     * @return null
     * @throws \Magento\Framework\Exception\LocalizedException
     */
    public function getProductCollection()
    {
        if (empty($this->hawkData)) {
            $this->fetchResponse();
        }

        $skus = array();
        $map = array();
        $bySku = array();
        $i = 0;
        $results = json_decode($this->hawkData->Data->Results);
        if (!property_exists($results, 'Items') || count($results->Items) == 0) {
            return $this->getResourceCollection([]);
        }
        foreach ($results->Items as $item) {
            if (isset($item->Custom->sku)) {
                $skus[] = $item->Custom->sku;
                $map[$item->Custom->sku] = $i;
                $bySku[$item->Custom->sku] = $item;
                $i++;
            }
        }
        if (empty($skus)) {
            return null;
        }

        /** @var \Magento\Catalog\Model\ResourceModel\Product\Collection $collection */
        $collection = $this->getResourceCollection($skus);

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
                $p->setHawkItem($bySku[$p->getSku()]);
                $collection->removeItemByKey($p->getId());
                $collection->addItem($p);
            }
        }

        return $collection;
    }

    public function getFeaturedProductCollection($zone)
    {
        if (empty($this->hawkData)) {
            $this->fetchResponse();
        }
        $skus = array();
        $map = array();
        $i = 0;

        if (!$this->hawkData->Data->FeaturedItems instanceof \stdClass) {
            $this->hawkData->Data->FeaturedItems = json_decode($this->hawkData->Data->FeaturedItems);
        }
        if (count($this->hawkData->Data->FeaturedItems->Items->Items) == 0) {
            return null;
        } else {
            foreach ($this->hawkData->Data->FeaturedItems->Items->Items as $banner) {
                if ($banner->Zone == $zone && isset($banner->Items)) {
                    foreach ($banner->Items as $item) {
                        if (isset($item->Custom->sku)) {
                            $skus[] = $item->Custom->sku;
                            $map[$item->Custom->sku] = $i;
                            $i++;
                        }
                    }
                }
            }
        }

        $productCollection = $this->collectionFactory->create();
        $collection = $productCollection
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

            $client = new \Zend_Http_Client();
            $client->setConfig(['timeout' => 60]);


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
        } catch (\Exception $e) {
            $this->log($e);
            return json_encode(['Message' => "Internal Error - " . $e->getMessage()]);
        }
    }

    public function getLPCacheKey()
    {
        return self::LP_CACHE_KEY . $this->storeManager->getStore()->getId();
    }

    public function getLandingPages($force = false)
    {
        if (($serialized = $this->cache->load($this->getLPCacheKey()))) {
            $this->landingPages = unserialize($serialized);
        } else {
            $this->landingPages = json_decode($this->getHawkResponse(\Zend_Http_Client::GET, 'LandingPage/Urls'));
            sort($this->landingPages, SORT_STRING);
            $this->cache->save(serialize($this->landingPages), $this->getLPCacheKey(), array(), 300);
        }
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
        if (in_array($path, ['/catalogsearch/result/', '/catalogsearch/result', '/hawkproxy/']) && $this->getConfigurationData('hawksearch_proxy/proxy/manage_search')) {
            return true;
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
        $this->isManaged = false;
        return $this->isManaged;
    }

    public function getCategoryStoreId()
    {
        $code = $this->getConfigurationData('hawksearch_proxy/proxy/store_code');

        /** @var Mage_Core_Model_Resource_Store_Collection $store */
        $store = $this->storeCollectionFactory->create();
        return $store->addFieldToFilter('code', $code)->getFirstItem()->getId();

    }

    private function getLandingPageObject($name, $url, $xml, $cid, $clear = false)
    {
        $custom = '';
        if (!$clear) {
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

    private function createExistingCustomFieldMap($hawklist)
    {
        $a = [];
        foreach ($hawklist as $item) {
            if (isset($item['custom'])) {
                $a[$item['custom']] = $item;
            }
        }
        return $a;
    }

    private function clearExistingCustomField($lpObject, $existingCustom)
    {
        if (isset($existingCustom[$lpObject['Custom']]) && $existingCustom[$lpObject['Custom']]['hawkurl'] != $lpObject['CustomUrl']) {
            preg_match('/__mage_catid_(\d+)__/', $existingCustom[$lpObject['Custom']]['custom'], $matches);
            if ($matches[1]) {
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

    private function syncHawkLandingByStore(Store $store)
    {
        $this->log(sprintf('Starting environment for store %s', $store->getName()));

        $this->emulation->startEnvironmentEmulation($store->getId());
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
                $this->validateHawkLandingPageResponse($resp, \Zend_Http_Client::POST, $mageList[$right]['hawkurl'], json_encode($lpObject));

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
                $customVal = $this->clearExistingCustomField($lpObject, $existingCustom);

                $resp = $this->getHawkResponse(\Zend_Http_Client::PUT, self::HAWK_LANDING_PAGE_URL . $hawkList[$left]['pageid'], json_encode($lpObject));
                $this->validateHawkLandingPageResponse($resp, \Zend_Http_Client::PUT, $hawkList[$left]['hawkurl'], json_encode($lpObject));

                $this->log(sprintf('attempt to update page %s resulted in %s', $hawkList[$left]['hawkurl'], $resp));
                $left++;
                $right++;
            }
            if (isset($existingCustom[$customVal])) {
                unset($existingCustom[$customVal]);
            }
        }

        $this->emulation->stopEnvironmentEmulation();
    }

    /**
     * @return array
     */
    public function synchronizeHawkLandingPages()
    {
        $stores = $this->storeManager->getStores();
        $errors = [];
        foreach ($stores as $store) {
            /** @var Store $store */
            if ($store->getConfig('hawksearch_proxy/general/enabled') && $store->isActive()) {
                try {
                    $this->syncHawkLandingByStore($store);
                } catch (\Exception $e) {
                    $errors[] = sprintf("Error syncing category pages for store '%s'", $store->getCode());
                    $errors[] = sprintf("Exception message: %s", $e->getMessage());
                    continue;
                }
            }
        }
        return $errors;
    }

    public function getHawkLandingPages()
    {
        $hawkPages = array();
        $pages = json_decode($this->getHawkResponse(\Zend_Http_Client::GET, 'LandingPage'));
        foreach ($pages as $page) {
            if (empty($page->Custom) && !$this->overwriteFlag)
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
        $collection = $this->categoryCollectionFactory->create();
        $collection->addAttributeToSelect(array('name', 'is_active', 'parent_id', 'position', 'include_in_menu'));
        $collection->addAttributeToFilter('is_active', array('eq' => '1'));
        $collection->addAttributeToSort('entity_id')->addAttributeToSort('parent_id')->addAttributeToSort('position');
        $collection->addAttributeToFilter('level', ['gteq' => '2']);
        if (!$this->getManageAll()) {
            $collection->addAttributeToFilter('hawk_landing_page', ['eq' => '1']);
        }

        $collection->joinUrlRewrite();
        $collection->setPageSize(1000);
        $pages = $collection->getLastPageNumber();
        $currentPage = 1;
        $cats = [];

        do {
            $collection->clear();
            $collection->setCurPage($currentPage);
            $collection->load();
            foreach ($collection as $cat) {
                $cats[] = array(
                    'hawkurl' => sprintf("/%s", $this->getRequestPath($cat)),
                    'name' => $cat->getName(),
                    'catid' => $cat->getId(),
                    'pid' => $cat->getParentId()
                );
            }
            $currentPage++;
        } while ($currentPage <= $pages);

        return $cats;
    }

    protected function getRequestPath(\Magento\Catalog\Model\Category $category)
    {
        if ($category->hasData('request_path') && $category->getRequestPath() != null) {
            return $category->getRequestPath();
        }
        $rewrite = $this->urlFinder->findOneByData([
            \Magento\UrlRewrite\Service\V1\Data\UrlRewrite::ENTITY_ID => $category->getId(),
            \Magento\UrlRewrite\Service\V1\Data\UrlRewrite::ENTITY_TYPE => \Magento\CatalogUrlRewrite\Model\CategoryUrlRewriteGenerator::ENTITY_TYPE,
            \Magento\UrlRewrite\Service\V1\Data\UrlRewrite::STORE_ID => $category->getStoreId(),
        ]);
        if ($rewrite) {
            return $rewrite->getRequestPath();
        }
        return null;
    }

    /**
     * @param $message
     */
    public function log($message)
    {
        if ($this->isLoggingEnabled()) {
            $this->_logger->addDebug($message);
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
        $collection = $this->categoryCollectionFactory->create();
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
            return file_get_contents($filename);
        }
        return false;
    }

    public function launchSyncProcess()
    {
        try {
            $tmppath = $this->filesystem->getDirectoryWrite('tmp')->getAbsolutePath();
            $tmpfile = tempnam($tmppath, 'hawkproxy_');

            $parts = explode(DIRECTORY_SEPARATOR, __FILE__);
            array_pop($parts);
            $parts[] = 'Runsync.php';
            $runfile = implode(DIRECTORY_SEPARATOR, $parts);
            $root = BP;

            $f = fopen($tmpfile, 'w');

            $phpbin = PHP_BINDIR . DIRECTORY_SEPARATOR . "php";

            if ($this->overwriteFlag) {
                fwrite($f, "$phpbin -d memory_limit=-1 $runfile -r $root -t $tmpfile -f 1\n");
            } else {
                fwrite($f, "$phpbin -d memory_limit=-1 $runfile -r $root -t $tmpfile\n");
            }

            $syncLog = implode(DIRECTORY_SEPARATOR, [BP, 'var', 'log', 'hawk_sync_exception.log']);
            shell_exec("/bin/sh $tmpfile > $syncLog 2>&1 &");

            return true;
        } catch (\Exception $e) {
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

        if (!$relPath) {
            $relPath = \HawkSearch\Datafeed\Helper\Data::DEFAULT_FEED_PATH;
        }
        $mediaRoot = $this->filesystem->getDirectoryWrite('media')->getAbsolutePath();

        if (strpos(strrev($mediaRoot), '/') !== 0) {
            $fullPath = implode(DIRECTORY_SEPARATOR, array($mediaRoot, $relPath));
        } else {
            $fullPath = $mediaRoot . $relPath;
        }

        if (!file_exists($fullPath)) {
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

    public function setOverwriteFlag($bool)
    {
        $this->overwriteFlag = $bool;
    }

    public function isCategorySyncCronEnabled()
    {
        return $this->scopeConfig->isSetFlag(self::CONFIG_PROXY_CATEGORY_SYNC_CRON_ENABLED);
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

            /** @var ProxyEmail $mail_helper */
            $mail_helper = $this->email_helper->create();

            try {
                $mail_helper->sendEmail($receiver, [
                    'status_text' => $status_text,
                    'extra_html' => $extra_html
                ]);
                return true;
            } catch (\Exception $e) {
                $this->log('-- Error: ' . $e->getMessage() . ' - File: ' . $e->getFile() . ' on line ' . $e->getLine());
                return false;
            }
        }
        return true;
    }

    public function getEnableCustomSearchRoute()
    {
        return $this->getConfigurationData(self::CONFIG_PROXY_ENABLE_CUSTOM_SEARCH_ROUTE);
    }

    public function getEnableLandingPageRoute()
    {
        return $this->getConfigurationData(self::CONFIG_PROXY_ENABLE_LANDING_PAGE_ROUTE);
    }

    public function getEnabled()
    {
        return $this->scopeConfig->isSetFlag(self::CONFIG_PROXY_ENABLED, ScopeInterface::SCOPE_STORE);
    }

    public function getShowTabs()
    {
        return $this->getConfigurationData(self::CONFIG_PROXY_SHOWTABS);

    }

    public function getResourceCollection(array $skus)
    {
        /** @var \Magento\Catalog\Model\ResourceModel\Product\Collection $collection */
        $collection = $this->collectionFactory->create();
        $collection
            ->addAttributeToSelect($this->catalogConfig->getProductAttributes())
            ->addAttributeToFilter('sku', array('in' => $skus))
            ->addMinimalPrice()
            ->addFinalPrice()
            ->addTaxPercents()
            ->addUrlRewrite();
        return $collection;
    }

    public function getTypeLabelMap()
    {
        /** @var stdClass $map */
        $obj = json_decode($this->getConfigurationData(self::CONFIG_PROXY_TYPE_LABEL));
        $map = [];
        if (is_object($obj)) {
            foreach ($obj as $key => $item) {
                $map[$item->code] = $item;
            }
        }
        return $map;
    }

    public function getShowTypeLabels()
    {
        return $this->getConfigurationData(self::CONFIG_PROXY_SHOW_TYPE_LABELS);
    }

    public function generateColor($value)
    {
        return sprintf('#%s', substr(md5($value), 0, 6));
    }

    public function generateTextColor($rgb)
    {
        $r = hexdec(substr($rgb, 1, 2));
        $g = hexdec(substr($rgb, 3, 2));
        $b = hexdec(substr($rgb, 5, 2));
        if (($r * 299 + $g * 587 + $b * 114) / 1000 < 123) {
            return '#fff';
        }
        return '#000';
    }

    public function getSearchRobots()
    {
        return $this->getConfigurationData(self::CONFIG_PROXY_META_ROBOTS);
    }

    public function modeActive(string $mode)
    {
        switch ($mode) {
            case 'proxy':
                return true;
            case 'catalogsearch':
                return $this->isManageSearch();
            case 'category':
                return $this->isManageCategories();
        }
        return false;
    }
}

