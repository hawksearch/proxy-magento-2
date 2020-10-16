<?php
/**
 * Copyright (c) 2020 Hawksearch (www.hawksearch.com) - All Rights Reserved
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
 * IN THE SOFTWARE.
 */

declare(strict_types=1);

namespace HawkSearch\Proxy\Model\Config;

use HawkSearch\Connector\Model\ConfigProvider;
use HawkSearch\Proxy\Model\Config\General as GeneralConfigProvider;
use Magento\Framework\App\Config\ScopeConfigInterface;
use Magento\Store\Api\Data\StoreInterface;

class Proxy extends ConfigProvider
{
    /**#@+
     * Configuration paths
     */
    const CONFIG_MANAGE_CATEGORIES = 'manage_categories';
    const CONFIG_MANAGE_ALL = 'manage_all';
    const CONFIG_ENABLE_HAWK_LANDING_PAGES = 'enable_hawk_landing_pages';
    const CONFIG_HAWK_LANDING_PAGES_CACHE = 'hawk_landing_pages_cache';
    const CONFIG_MANAGE_SEARCH = 'manage_search';
    const CONFIG_HAWKSEARCH_INCLUDE_CSS = 'hawksearch_include_css';
    const CONFIG_SEARCH_BOX_IDS = 'search_box_ids';
    const CONFIG_AUTOCOMPLETE_DIV_ID = 'autocomplete_div_id';
    const CONFIG_AUTOCOMPLETE_QUERY_PARAMS = 'autocomplete_query_params';
    const CONFIG_SHOW_TABS = 'show_tabs';
    const CONFIG_RESULT_TYPE = 'result_type';
    const CONFIG_META_ROBOTS = 'meta_robots';
    const CONFIG_ENABLE_CUSTOM_SEARCH_ROUTE = 'enable_custom_search_route';
    const CONFIG_CUSTOM_SEARCH_ROUTE = 'custom_search_route';
    const CONFIG_ALLOW_FULLTEXT = 'allow_fulltext';
    const CONFIG_TYPE_LABEL = 'type_label';
    const CONFIG_SHOW_TYPE_LABELS = 'show_type_labels';
    /**#@-*/

    /**
     * @var General
     */
    private $generalConfigProvider;

    /**
     * Proxy constructor.
     * @param ScopeConfigInterface $scopeConfig
     * @param General $generalConfigProvider
     * @param null $configRootPath
     * @param null $configGroup
     */
    public function __construct(
        ScopeConfigInterface $scopeConfig,
        GeneralConfigProvider $generalConfigProvider,
        $configRootPath = null,
        $configGroup = null
    ) {
        parent::__construct($scopeConfig, $configRootPath, $configGroup);
        $this->generalConfigProvider = $generalConfigProvider;
    }

    /**
     * @param StoreInterface|int|null $store
     * @return bool
     */
    public function isManageCategories($store = null): bool
    {
        return $this->generalConfigProvider->isEnabled() && $this->getConfig(self::CONFIG_MANAGE_CATEGORIES, $store);
    }

    /**
     * @param StoreInterface|int|null $store
     * @return bool
     */
    public function isManageAllCategories($store = null): bool
    {
        return !!$this->getConfig(self::CONFIG_MANAGE_ALL, $store);
    }

    /**
     * @param StoreInterface|int|null $store
     * @return bool
     */
    public function isManageSearch($store = null): bool
    {
        return $this->generalConfigProvider->isEnabled() && $this->getConfig(self::CONFIG_MANAGE_SEARCH, $store);
    }

    /**
     * @param StoreInterface|int|null $store
     * @return bool
     */
    public function isHawkCssIncluded($store = null): bool
    {
        return !!$this->getConfig(self::CONFIG_HAWKSEARCH_INCLUDE_CSS, $store);
    }

    /**
     * @param StoreInterface|int|null $store
     * @return array
     */
    public function getSearchBoxIds($store = null): array
    {
        $ids = explode(',', $this->getConfig(self::CONFIG_SEARCH_BOX_IDS, $store) ?: '');
        return array_filter(array_map('trim', $ids));
    }

    /**
     * @param StoreInterface|int|null $store
     * @return string | null
     */
    public function getAutocompleteDivId($store = null): ?string
    {
        return $this->getConfig(self::CONFIG_AUTOCOMPLETE_DIV_ID, $store);
    }

    /**
     * @param StoreInterface|int|null $store
     * @return string | null
     */
    public function getAutocompleteQueryParams($store = null): ?string
    {
        return $this->getConfig(self::CONFIG_AUTOCOMPLETE_QUERY_PARAMS, $store);
    }

    /**
     * @param StoreInterface|int|null $store
     * @return bool
     */
    public function showTabs($store = null): bool
    {
        return !!$this->getConfig(self::CONFIG_SHOW_TABS, $store);
    }

    /**
     * @param StoreInterface|int|null $store
     * @return string | null
     */
    public function getResultType($store = null): ?string
    {
        return $this->getConfig(self::CONFIG_RESULT_TYPE, $store);
    }

    /**
     * @param StoreInterface|int|null $store
     * @return string | null
     */
    public function getMetaRobots($store = null): ?string
    {
        return $this->getConfig(self::CONFIG_META_ROBOTS, $store);
    }

    /**
     * @param StoreInterface|int|null $store
     * @return bool
     */
    public function isCustomSearchRouteEnabled($store = null): bool
    {
        return $this->generalConfigProvider->isEnabled()
            && $this->getConfig(self::CONFIG_ENABLE_CUSTOM_SEARCH_ROUTE, $store);
    }

    /**
     * @param StoreInterface|int|null $store
     * @return string|null
     */
    public function getCustomSearchRoute($store = null): ?string
    {
        return $this->getConfig(self::CONFIG_CUSTOM_SEARCH_ROUTE, $store);
    }

    /**
     * @param StoreInterface|int|null $store
     * @return bool
     */
    public function isLandingPageRouteEnabled($store = null) : bool
    {
        return $this->generalConfigProvider->isEnabled()
            && $this->getConfig(self::CONFIG_ENABLE_HAWK_LANDING_PAGES, $store);
    }

    /**
     * @param StoreInterface|int|null $store
     * @return int
     */
    public function getLandingPagesCache($store = null): int
    {
        return (int)$this->getConfig(self::CONFIG_HAWK_LANDING_PAGES_CACHE, $store);
    }

    /**
     * @param StoreInterface|int|null $store
     * @return bool
     */
    public function allowFulltext($store = null): bool
    {
        return !!$this->getConfig(self::CONFIG_ALLOW_FULLTEXT, $store);
    }

    /**
     * @param StoreInterface|int|null $store
     * @return string|null
     */
    public function getTypeLabel($store = null): ?string
    {
        return $this->getConfig(self::CONFIG_TYPE_LABEL, $store);
    }

    /**
     * @param StoreInterface|int|null $store
     * @return bool
     */
    public function showTypeLabels($store = null): bool
    {
        return !!$this->getConfig(self::CONFIG_SHOW_TYPE_LABELS, $store);
    }
}
