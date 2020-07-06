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
    const CONFIG_PROXY_MODE = 'hawksearch_proxy/proxy/mode';
    const CONFIG_ENGINE_NAME = 'hawksearch_proxy/proxy/engine_name';
    const CONFIG_HAWK_URL = 'hawksearch_proxy/proxy/hawk_url_settings/hawk_url_%s';
    const CONFIG_INCLUDE_HAWK_CSS = 'hawksearch_proxy/proxy/hawksearch_include_css';
    const CONFIG_ORDER_TRACKING_KEY = 'hawksearch_proxy/proxy/order_tracking_key';
    const CONFIG_IS_LOGGING_ENABLED = 'hawksearch_proxy/general/logging_enabled';
    const CONFIG_PROXY_SHOWTABS = 'hawksearch_proxy/proxy/show_tabs';
    const CONFIG_PROXY_RESULT_TYPE = 'hawksearch_proxy/proxy/result_type';
    const CONFIG_PROXY_MANAGE_SEARCH = 'hawksearch_proxy/proxy/manage_search';
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
     * @param null $store
     * @return bool | null
     */
    public function isHawkCssIncluded($store = null) : ?bool
    {
        return (bool)$this->getConfig(self::CONFIG_INCLUDE_HAWK_CSS, $store);
    }

    /**
     * @param null $store
     * @return bool | null
     */
    public function isLoggingEnabled($store = null) : ?bool
    {
        return (bool)$this->getConfig(self::CONFIG_IS_LOGGING_ENABLED, $store);
    }

    /**
     * @param null $store
     * @return string | null
     */
    public function getMode($store = null) : ?string
    {
        return $this->getConfig(self::CONFIG_PROXY_MODE, $store);
    }

    /**
     * @param null $store
     * @return string | null
     */
    public function getEngineName($store = null) : ?string
    {
        return $this->getConfig(self::CONFIG_ENGINE_NAME, $store);
    }

    /**
     * @param null $store
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
     * @param null $store
     * @return string | null
     */
    public function getHawkUrl($store = null) : ?string
    {
        $hawkUrl = $this->getHawkUrlHost($store);
        if ('/' == substr($hawkUrl, -1)) {
            return $hawkUrl . 'sites/' . $this->getEngineName($store);
        }
        return $hawkUrl . '/sites/' . $this->getEngineName($store);
    }

    /**
     * @param null $store
     * @return string | null
     */
    public function getTrackingPixelUrl($store = null) : ?string
    {
        $hawkUrl = $this->getHawkUrlHost($store);
        if ('/' == substr($hawkUrl, -1)) {
            return $hawkUrl . 'sites/_hawk/hawkconversion.aspx?';
        }
        return $hawkUrl . '/sites/_hawk/hawkconversion.aspx?';
    }

    /**
     * @param null $store
     * @return string | null
     */
    public function getOrderTrackingKey($store = null) : ?string
    {
        return $this->getConfig(self::CONFIG_ORDER_TRACKING_KEY, $store);
    }

    /**
     * @param null $store
     * @return bool | null
     */
    public function showTabs($store = null) : ?bool
    {
        return (bool)$this->getConfig(self::CONFIG_PROXY_SHOWTABS, $store);
    }

    /**
     * @param null $store
     * @return string | null
     */
    public function getResultType($store = null) : ?string
    {
        return $this->getConfig(self::CONFIG_PROXY_RESULT_TYPE, $store);
    }

    /**
     * @param null $store
     * @return bool | null
     */
    public function manageSearch($store = null) : ?bool
    {
        return (bool)$this->getConfig(self::CONFIG_PROXY_MANAGE_SEARCH, $store);
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
