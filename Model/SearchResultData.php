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
declare(strict_types=1);

namespace HawkSearch\Proxy\Model;

use HawkSearch\Proxy\Api\Data\SearchResultContentInterface;
use HawkSearch\Proxy\Api\Data\SearchResultContentInterfaceFactory;
use HawkSearch\Proxy\Api\Data\SearchResultDataInterface;
use HawkSearch\Proxy\Api\Data\SearchResultFeaturedInterface;
use HawkSearch\Proxy\Api\Data\SearchResultFeaturedInterfaceFactory;
use HawkSearch\Proxy\Api\Data\SearchResultMerchandisingInterface;
use HawkSearch\Proxy\Api\Data\SearchResultMerchandisingInterfaceFactory;
use Magento\Framework\Api\AbstractSimpleObject;

class SearchResultData extends AbstractSimpleObject implements SearchResultDataInterface
{
    /**
     * @var SearchResultContentInterfaceFactory
     */
    private $searchResultContentInterfaceFactory;

    /**
     * @var SearchResultMerchandisingInterfaceFactory
     */
    private $searchResultMerchandisingInterfaceFactory;

    /**
     * @var SearchResultFeaturedInterfaceFactory
     */
    private $searchResultFeaturedInterfaceFactory;

    /**
     * SearchResultData constructor.
     *
     * @param SearchResultContentInterfaceFactory $searchResultContentInterfaceFactory
     * @param SearchResultMerchandisingInterfaceFactory $searchResultMerchandisingInterfaceFactory
     * @param SearchResultFeaturedInterfaceFactory $searchResultFeaturedInterfaceFactory
     */
    public function __construct(
        SearchResultContentInterfaceFactory $searchResultContentInterfaceFactory,
        SearchResultMerchandisingInterfaceFactory $searchResultMerchandisingInterfaceFactory,
        SearchResultFeaturedInterfaceFactory $searchResultFeaturedInterfaceFactory
    )
    {
        $this->searchResultContentInterfaceFactory = $searchResultContentInterfaceFactory;
        $this->searchResultMerchandisingInterfaceFactory = $searchResultMerchandisingInterfaceFactory;
        $this->searchResultFeaturedInterfaceFactory = $searchResultFeaturedInterfaceFactory;
    }

    /**
     * @inheritDoc
     */
    public function getTitle(): string
    {
        return (string)$this->_get(self::TITLE);
    }

    /**
     * @inheritDoc
     */
    public function setTitle(?string $value)
    {
        return $this->setData(self::TITLE, $value);
    }

    /**
     * @inheritDoc
     */
    public function getTopText(): string
    {
        return (string)$this->_get(self::TOP_TEXT);
    }

    /**
     * @inheritDoc
     */
    public function setTopText(?string $value)
    {
        return $this->setData(self::TOP_TEXT, $value);
    }

    /**
     * @inheritDoc
     */
    public function getBreadCrumb(): string
    {
        return (string)$this->_get(self::BREADCRUMB);
    }

    /**
     * @inheritDoc
     */
    public function setBreadCrumb(?string $value)
    {
        return $this->setData(self::BREADCRUMB, $value);
    }

    /**
     * @inheritDoc
     */
    public function getTopPager(): string
    {
        return (string)$this->_get(self::TOP_PAGER);
    }

    /**
     * @inheritDoc
     */
    public function setTopPager(?string $value)
    {
        return $this->setData(self::TOP_PAGER, $value);
    }

    /**
     * @inheritDoc
     */
    public function getBottomPager(): string
    {
        return (string)$this->_get(self::BOTTOM_PAGER);
    }

    /**
     * @inheritDoc
     */
    public function setBottomPager(?string $value)
    {
        return $this->setData(self::BOTTOM_PAGER, $value);
    }

    /**
     * @inheritDoc
     */
    public function getResults(): SearchResultContentInterface
    {
        return $this->_get(self::RESULTS) ?? $this->searchResultContentInterfaceFactory->create();
    }

    /**
     * @inheritDoc
     */
    public function setResults(?SearchResultContentInterface $value)
    {
        return $this->setData(self::RESULTS, $value);
    }

    /**
     * @inheritDoc
     */
    public function getMerchandising(): SearchResultMerchandisingInterface
    {
        return $this->_get(self::MERCHANDISING) ?? $this->searchResultMerchandisingInterfaceFactory->create();
    }

    /**
     * @inheritDoc
     */
    public function setMerchandising(?SearchResultMerchandisingInterface $value)
    {
        return $this->setData(self::MERCHANDISING, $value);
    }

    /**
     * @inheritDoc
     */
    public function getSelections(): string
    {
        return (string)$this->_get(self::SELECTIONS);
    }

    /**
     * @inheritDoc
     */
    public function setSelections(?string $value)
    {
        return $this->setData(self::SELECTIONS, $value);
    }

    /**
     * @inheritDoc
     */
    public function getFacets(): string
    {
        return (string)$this->_get(self::FACETS);
    }

    /**
     * @inheritDoc
     */
    public function setFacets(?string $value)
    {
        return $this->setData(self::FACETS, $value);
    }

    /**
     * @inheritDoc
     */
    public function getRelated(): string
    {
        return (string)$this->_get(self::RELATED);
    }

    /**
     * @inheritDoc
     */
    public function setRelated(?string $value)
    {
        return $this->setData(self::RELATED, $value);
    }

    /**
     * @inheritDoc
     */
    public function getFeaturedItems(): SearchResultFeaturedInterface
    {
        return $this->_get(self::FEATURED_ITEMS) ?? $this->searchResultFeaturedInterfaceFactory->create();
    }

    /**
     * @inheritDoc
     */
    public function setFeaturedItems(?SearchResultFeaturedInterface $value)
    {
        return $this->setData(self::FEATURED_ITEMS, $value);
    }

    /**
     * @inheritDoc
     */
    public function getTabs(): string
    {
        return (string)$this->_get(self::TABS);
    }

    /**
     * @inheritDoc
     */
    public function setTabs(?string $value)
    {
        return $this->setData(self::TABS, $value);
    }
}
