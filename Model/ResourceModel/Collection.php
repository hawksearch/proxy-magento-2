<?php
/**
 * Copyright (c) 2023 Hawksearch (www.hawksearch.com) - All Rights Reserved
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
 * IN THE SOFTWARE.
 */

namespace HawkSearch\Proxy\Model\ResourceModel;

use HawkSearch\Proxy\Model\Config\Proxy as ProxyConfigProvider;
use Magento\Catalog\Model\Indexer\Product\Flat\State;
use Magento\Catalog\Model\Product\OptionFactory;
use Magento\Catalog\Model\ResourceModel\Helper;
use Magento\Catalog\Model\ResourceModel\Product\Collection\ProductLimitationFactory;
use Magento\Catalog\Model\ResourceModel\Url;
use Magento\CatalogSearch\Model\ResourceModel\Fulltext\Collection\DefaultFilterStrategyApplyCheckerInterface;
use Magento\CatalogSearch\Model\ResourceModel\Fulltext\Collection\SearchCriteriaResolverFactory;
use Magento\CatalogSearch\Model\ResourceModel\Fulltext\Collection\SearchResultApplierFactory;
use Magento\CatalogSearch\Model\ResourceModel\Fulltext\Collection\TotalRecordsResolverFactory;
use Magento\Customer\Api\GroupManagementInterface;
use Magento\Customer\Model\Session;
use Magento\Eav\Model\Config;
use Magento\Eav\Model\EntityFactory;
use Magento\Framework\Api\FilterBuilder;
use Magento\Framework\Api\Search\SearchCriteriaBuilder;
use Magento\Framework\Api\Search\SearchResultFactory;
use Magento\Framework\App\Config\ScopeConfigInterface;
use Magento\Framework\App\ResourceConnection;
use Magento\Framework\Data\Collection\Db\FetchStrategyInterface;
use Magento\Framework\DB\Adapter\AdapterInterface;
use Magento\Framework\EntityManager\MetadataPool;
use Magento\Framework\Event\ManagerInterface;
use Magento\Framework\Exception\LocalizedException;
use Magento\Framework\Module\Manager;
use Magento\Framework\Search\Adapter\Mysql\TemporaryStorageFactory;
use Magento\Framework\Search\Request\Builder;
use Magento\Framework\Stdlib\DateTime;
use Magento\Framework\Stdlib\DateTime\TimezoneInterface;
use Magento\Framework\Validator\UniversalFactory;
use Magento\Search\Api\SearchInterface;
use Magento\Search\Model\QueryFactory;
use Magento\Search\Model\SearchEngine;
use Magento\Store\Model\StoreManagerInterface;
use Psr\Log\LoggerInterface;

class Collection extends \Magento\CatalogSearch\Model\ResourceModel\Fulltext\Collection
{
    /**
     * @var ProxyConfigProvider
     */
    private $proxyConfigProvider;

    /**
     * Collection constructor.
     * @param \Magento\Framework\Data\Collection\EntityFactory $entityFactory
     * @param LoggerInterface $logger
     * @param FetchStrategyInterface $fetchStrategy
     * @param ManagerInterface $eventManager
     * @param Config $eavConfig
     * @param ResourceConnection $resource
     * @param EntityFactory $eavEntityFactory
     * @param Helper $resourceHelper
     * @param UniversalFactory $universalFactory
     * @param StoreManagerInterface $storeManager
     * @param Manager $moduleManager
     * @param State $catalogProductFlatState
     * @param ScopeConfigInterface $scopeConfig
     * @param OptionFactory $productOptionFactory
     * @param Url $catalogUrl
     * @param TimezoneInterface $localeDate
     * @param Session $customerSession
     * @param DateTime $dateTime
     * @param GroupManagementInterface $groupManagement
     * @param QueryFactory $catalogSearchData
     * @param Builder $requestBuilder
     * @param SearchEngine $searchEngine
     * @param TemporaryStorageFactory $temporaryStorageFactory
     * @param ProxyConfigProvider $proxyConfigProvider
     * @param AdapterInterface|null $connection
     * @param string $searchRequestName
     * @param SearchResultFactory|null $searchResultFactory
     * @param ProductLimitationFactory|null $productLimitationFactory
     * @param MetadataPool|null $metadataPool
     * @param SearchInterface|null $search
     * @param SearchCriteriaBuilder|null $searchCriteriaBuilder
     * @param FilterBuilder|null $filterBuilder
     * @param SearchCriteriaResolverFactory|null $searchCriteriaResolverFactory
     * @param SearchResultApplierFactory|null $searchResultApplierFactory
     * @param TotalRecordsResolverFactory|null $totalRecordsResolverFactory
     * @param DefaultFilterStrategyApplyCheckerInterface|null $defaultFilterStrategyApplyChecker
     */
    public function __construct(
        \Magento\Framework\Data\Collection\EntityFactory $entityFactory,
        LoggerInterface $logger,
        FetchStrategyInterface $fetchStrategy,
        ManagerInterface $eventManager,
        Config $eavConfig,
        ResourceConnection $resource,
        EntityFactory $eavEntityFactory,
        Helper $resourceHelper,
        UniversalFactory $universalFactory,
        StoreManagerInterface $storeManager,
        Manager $moduleManager,
        State $catalogProductFlatState,
        ScopeConfigInterface $scopeConfig,
        OptionFactory $productOptionFactory,
        Url $catalogUrl,
        TimezoneInterface $localeDate,
        Session $customerSession,
        DateTime $dateTime,
        GroupManagementInterface $groupManagement,
        QueryFactory $catalogSearchData,
        Builder $requestBuilder,
        SearchEngine $searchEngine,
        TemporaryStorageFactory $temporaryStorageFactory,
        ProxyConfigProvider $proxyConfigProvider,
        AdapterInterface $connection = null,
        $searchRequestName = 'catalog_view_container',
        SearchResultFactory $searchResultFactory = null,
        ProductLimitationFactory $productLimitationFactory = null,
        MetadataPool $metadataPool = null,
        SearchInterface $search = null,
        SearchCriteriaBuilder $searchCriteriaBuilder = null,
        FilterBuilder $filterBuilder = null,
        SearchCriteriaResolverFactory $searchCriteriaResolverFactory = null,
        SearchResultApplierFactory $searchResultApplierFactory = null,
        TotalRecordsResolverFactory $totalRecordsResolverFactory = null,
        DefaultFilterStrategyApplyCheckerInterface $defaultFilterStrategyApplyChecker = null
    ) {
        parent::__construct(
            $entityFactory,
            $logger,
            $fetchStrategy,
            $eventManager,
            $eavConfig,
            $resource,
            $eavEntityFactory,
            $resourceHelper,
            $universalFactory,
            $storeManager,
            $moduleManager,
            $catalogProductFlatState,
            $scopeConfig,
            $productOptionFactory,
            $catalogUrl,
            $localeDate,
            $customerSession,
            $dateTime,
            $groupManagement,
            $catalogSearchData,
            $requestBuilder,
            $searchEngine,
            $temporaryStorageFactory,
            $connection,
            $searchRequestName,
            $searchResultFactory,
            $productLimitationFactory,
            $metadataPool,
            $search,
            $searchCriteriaBuilder,
            $filterBuilder,
            $searchCriteriaResolverFactory,
            $searchResultApplierFactory,
            $totalRecordsResolverFactory,
            $defaultFilterStrategyApplyChecker
        );
        $this->proxyConfigProvider = $proxyConfigProvider;
    }

    /**
     * @inheritDoc
     * @throws LocalizedException
     */
    protected function _renderFiltersBefore()
    {
        if ($this->proxyConfigProvider->isManageCategories() && !$this->proxyConfigProvider->allowFulltext()) {
            return;
        }

        parent::_renderFiltersBefore();
    }
}
