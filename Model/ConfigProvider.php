<?php
/**
 *  Copyright (c) 2020 Hawksearch (www.hawksearch.com) - All Rights Reserved
 *
 *  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 *  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 *  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 *  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 *  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 *  FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
 *  IN THE SOFTWARE.
 */
declare(strict_types=1);

namespace HawkSearch\Proxy\Model;

use Magento\Framework\App\Config\ScopeConfigInterface;
use Magento\Framework\Exception\FileSystemException;
use Magento\Framework\Exception\NoSuchEntityException;
use Magento\Framework\Filesystem;
use Magento\Store\Api\Data\StoreInterface;
use Magento\Store\Model\ResourceModel\Store\Collection;
use Magento\Store\Model\ResourceModel\Store\CollectionFactory;
use Magento\Store\Model\ScopeInterface;
use Magento\Store\Model\StoreManagerInterface;
use Psr\Log\LoggerInterface;

/**
 * Class ConfigProvider
 * System config provider
 */
class ConfigProvider
{
    /**#@+
     * Configuration paths
     */
    const CONFIG_PROXY_ENABLED = 'hawksearch_proxy/general/enabled';
    const CONFIG_PROXY_MODE = 'hawksearch_proxy/proxy/mode';
    const CONFIG_ENGINE_NAME = 'hawksearch_proxy/proxy/engine_name';
    const CONFIG_HAWK_URL = 'hawksearch_proxy/proxy/hawk_url_settings/hawk_url_%s';
    const CONFIG_INCLUDE_HAWK_CSS = 'hawksearch_proxy/proxy/hawksearch_include_css';
    const CONFIG_ORDER_TRACKING_KEY = 'hawksearch_proxy/proxy/order_tracking_key';
    const CONFIG_IS_LOGGING_ENABLED = 'hawksearch_proxy/general/logging_enabled';
    const CONFIG_PROXY_SHOWTABS = 'hawksearch_proxy/proxy/show_tabs';
    const CONFIG_PROXY_RESULT_TYPE = 'hawksearch_proxy/proxy/result_type';
    const CONFIG_PROXY_MANAGE_SEARCH = 'hawksearch_proxy/proxy/manage_search';
    const CONFIG_PROXY_ENABLE_LANDING_PAGE_ROUTE = 'hawksearch_proxy/proxy/enable_hawk_landing_pages';
    const CONFIG_PROXY_MANAGE_CATEGORIES = 'hawksearch_proxy/proxy/manage_categories';
    const CONFIG_PROXY_ENABLE_CUSTOM_SEARCH_ROUTE = 'hawksearch_proxy/proxy/enable_custom_search_route';
    const CONFIG_PROXY_CUSTOM_SEARCH_ROUTE = 'hawksearch_proxy/proxy/custom_search_route';
    const CONFIG_PROXY_META_ROBOTS = 'hawksearch_proxy/proxy/meta_robots';
    const CONFIG_PROXY_SEARCH_BOX_IDS = 'hawksearch_proxy/proxy/search_box_ids';
    const CONFIG_PROXY_AUTOCOMPLETE_DIV_ID = 'hawksearch_proxy/proxy/autocomplete_div_id';
    const CONFIG_PROXY_AUTOCOMPLETE_QUERY_PARAMS = 'hawksearch_proxy/proxy/autocomplete_query_params';
    const CONFIG_PROXY_RECOMMENDED_URL = 'hawksearch_proxy/proxy/rec_url_settings/rec_url_%s';
    const CONFIG_PROXY_TRACKING_URL = 'hawksearch_proxy/proxy/tracking_url_settings/tracking_url_%s';
    /**#@-*/

    /**
     * @var ScopeConfigInterface
     */
    private $scopeConfig;

    /**
     * Core store manager interface
     *
     * @var StoreManagerInterface
     */
    private $storeManager;

    /**
     * @var Filesystem
     */
    private $fileSystem;

    /**
     * @var CollectionFactory
     */
    private $storeCollectionFactory;

    /**
     * @var LoggerInterface
     */
    private $logger;

    /**
     * Current store instance
     *
     * @var StoreInterface
     */
    private $store = null;

    /**
     * @param ScopeConfigInterface $scopeConfig
     * @param StoreManagerInterface $storeManager
     * @param Filesystem $fileSystem
     * @param CollectionFactory $storeCollectionFactory
     * @param LoggerInterface $logger
     */
    public function __construct(
        ScopeConfigInterface $scopeConfig,
        StoreManagerInterface $storeManager,
        Filesystem $fileSystem,
        CollectionFactory $storeCollectionFactory,
        LoggerInterface $logger
    ) {
        $this->scopeConfig = $scopeConfig;
        $this->storeManager = $storeManager;
        $this->fileSystem = $fileSystem;
        $this->storeCollectionFactory = $storeCollectionFactory;
        $this->logger = $logger;
    }

    /**
     * @param StoreInterface|int|null $store
     * @return bool
     */
    public function isEnabled($store = null) : bool
    {
        return (bool)$this->getConfig(self::CONFIG_PROXY_ENABLED, $store);
    }

    /**
     * @param StoreInterface|int|null $store
     * @return bool
     */
    public function isHawkCssIncluded($store = null) : bool
    {
        return (bool)$this->getConfig(self::CONFIG_INCLUDE_HAWK_CSS, $store);
    }

    /**
     * @param StoreInterface|int|null $store
     * @return bool
     */
    public function isLoggingEnabled($store = null) : bool
    {
        return (bool)$this->getConfig(self::CONFIG_IS_LOGGING_ENABLED, $store);
    }

    /**
     * @param StoreInterface|int|null $store
     * @return string | null
     */
    public function getMode($store = null) : ?string
    {
        return $this->getConfig(self::CONFIG_PROXY_MODE, $store);
    }

    /**
     * @param StoreInterface|int|null $store
     * @return string | null
     */
    public function getEngineName($store = null) : ?string
    {
        return $this->getConfig(self::CONFIG_ENGINE_NAME, $store);
    }

    /**
     * @param StoreInterface|int|null $store
     * @return string | null
     */
    public function getHawkUrlHost($store = null) : ?string
    {
        return $this->getConfig(
            sprintf(self::CONFIG_HAWK_URL, $this->getMode($store)),
            $store
        );
    }

    /**
     * @param StoreInterface|int|null $store
     * @return string | null
     */
    public function getTrackingUrl($store = null) : ?string
    {
        return $this->getConfig(
            sprintf(self::CONFIG_PROXY_TRACKING_URL, $this->getMode($store)),
            $store
        );
    }

    /**
     * @param StoreInterface|int|null $store
     * @return string | null
     */
    public function getRecommendedUrl($store = null) : ?string
    {
        return $this->getConfig(
            sprintf(self::CONFIG_PROXY_RECOMMENDED_URL, $this->getMode($store)),
            $store
        );
    }

    /**
     * @param string|null $engine
     * @param StoreInterface|int|null $store
     * @return string | null
     */
    public function getHawkUrl($engine = null, $store = null) : ?string
    {
        $hawkUrl = rtrim($this->getHawkUrlHost($store), '/');
        return $hawkUrl . '/sites/' . ($engine ?? $this->getEngineName($store));
    }

    /**
     * @param StoreInterface|int|null $store
     * @return string | null
     */
    public function getTrackingPixelUrl($store = null) : ?string
    {
        $hawkUrl = rtrim($this->getHawkUrl('_hawk', $store), '/');
        return $hawkUrl . '/hawkconversion.aspx?';
    }

    /**
     * @param StoreInterface|int|null $store
     * @return string | null
     */
    public function getOrderTrackingKey($store = null) : ?string
    {
        return $this->getConfig(self::CONFIG_ORDER_TRACKING_KEY, $store);
    }

    /**
     * @param StoreInterface|int|null $store
     * @return bool
     */
    public function showTabs($store = null) : bool
    {
        return (bool)$this->getConfig(self::CONFIG_PROXY_SHOWTABS, $store);
    }

    /**
     * @param StoreInterface|int|null $store
     * @return string | null
     */
    public function getResultType($store = null) : ?string
    {
        return $this->getConfig(self::CONFIG_PROXY_RESULT_TYPE, $store);
    }

    /**
     * @param StoreInterface|int|null $store
     * @return bool
     */
    public function isSearchManagementEnabled($store = null) : bool
    {
        return $this->isEnabled() && $this->getConfig(self::CONFIG_PROXY_MANAGE_SEARCH, $store);
    }

    /**
     * @param StoreInterface|int|null $store
     * @return bool
     */
    public function isLandingPageRouteEnabled($store = null) : bool
    {
        return $this->isEnabled() && $this->getConfig(self::CONFIG_PROXY_ENABLE_LANDING_PAGE_ROUTE, $store);
    }

    /**
     * @param StoreInterface|int|null $store
     * @return bool
     */
    public function isCategoriesManagementEnabled($store = null) : bool
    {
        return $this->isEnabled() && $this->getConfig(self::CONFIG_PROXY_MANAGE_CATEGORIES, $store);
    }

    /**
     * @param StoreInterface|int|null $store
     * @return bool
     */
    public function isCustomSearchRouteEnabled($store = null) : bool
    {
        return $this->isEnabled() && $this->getConfig(self::CONFIG_PROXY_ENABLE_CUSTOM_SEARCH_ROUTE, $store);
    }

    /**
     * @param StoreInterface|int|null $store
     * @return string|null
     */
    public function getCustomSearchRoute($store = null) : ?string
    {
        return $this->getConfig(self::CONFIG_PROXY_CUSTOM_SEARCH_ROUTE, $store);
    }

    /**
     * @param StoreInterface|int|null $store
     * @return string | null
     */
    public function getMetaRobots($store = null) : ?string
    {
        return $this->getConfig(self::CONFIG_PROXY_META_ROBOTS, $store);
    }

    /**
     * @param StoreInterface|int|null $store
     * @return array
     */
    public function getSearchBoxIds($store = null) : array
    {
        $ids = explode(',', $this->getConfig(self::CONFIG_PROXY_SEARCH_BOX_IDS, $store));
        return array_filter(array_map('trim', $ids));
    }

    /**
     * @param StoreInterface|int|null $store
     * @return string | null
     */
    public function getAutocompleteDivId($store = null) : ?string
    {
        return $this->getConfig(self::CONFIG_PROXY_AUTOCOMPLETE_DIV_ID, $store);
    }

    /**
     * @param StoreInterface|int|null $store
     * @return string | null
     */
    public function getAutocompleteQueryParams($store = null) : ?string
    {
        return $this->getConfig(self::CONFIG_PROXY_AUTOCOMPLETE_QUERY_PARAMS, $store);
    }


    /**
     * Retrieve store object
     *
     * @param StoreInterface|int|null $store
     * @return StoreInterface
     * @throws NoSuchEntityException
     */
    public function getStore($store = null) : StoreInterface
    {
        if ($store) {
            if ($store instanceof StoreInterface) {
                $this->store = $store;
            } elseif (is_int($store)) {
                $this->store = $this->storeManager->getStore($store);
            }
        } else {
            $this->store = $this->storeManager->getStore();
        }

        return $this->store;
    }

    /**
     * Get Store Config value for path
     *
     * @param string $path Path to config value. Absolute from root or Relative from initialized root
     * @param int|StoreInterface|null $store
     * @return mixed
     */
    private function getConfig($path, $store)
    {
        $value = null;

        if ($store === null) {
            $store = $this->store;
        }

        try {
            $value = $this->scopeConfig->getValue(
                $path,
                ScopeInterface::SCOPE_STORE,
                $this->getStore($store)
            );
        } catch (NoSuchEntityException $e) {
            $this->logger->error($e->getMessage());
        }

        return $value;
    }
}
