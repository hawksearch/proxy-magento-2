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

use HawkSearch\Proxy\Api\Data\SearchResultContentInterface;
use HawkSearch\Proxy\Api\Data\SearchResultDataInterface;
use HawkSearch\Proxy\Api\Data\SearchResultFeaturedMainInterface;
use HawkSearch\Proxy\Api\Data\SearchResultMerchandisingInterface;
use Magento\Framework\DataObject;

class SearchResultData extends DataObject implements SearchResultDataInterface
{
    /**
     * @inheritDoc
     */
    public function getTitle(): ?string
    {
        return $this->getData(self::TITLE);
    }

    /**
     * @inheritDoc
     */
    public function setTitle(string $value)
    {
        return $this->setData(self::TITLE, $value);
    }

    /**
     * @inheritDoc
     */
    public function getTopText(): ?string
    {
        return $this->getData(self::TOP_TEXT);
    }

    /**
     * @inheritDoc
     */
    public function setTopText(string $value)
    {
        return $this->setData(self::TOP_TEXT, $value);
    }

    /**
     * @inheritDoc
     */
    public function getBreadCrumb(): ?string
    {
        return $this->getData(self::BREADCRUMB);
    }

    /**
     * @inheritDoc
     */
    public function setBreadCrumb(string $value)
    {
        return $this->setData(self::BREADCRUMB, $value);
    }

    /**
     * @inheritDoc
     */
    public function getTopPager(): ?string
    {
        return $this->getData(self::TOP_PAGER);
    }

    /**
     * @inheritDoc
     */
    public function setTopPager(string $value)
    {
        return $this->setData(self::TOP_PAGER, $value);
    }

    /**
     * @inheritDoc
     */
    public function getBottomPager(): ?string
    {
        return $this->getData(self::BOTTOM_PAGER);
    }

    /**
     * @inheritDoc
     */
    public function setBottomPager(string $value)
    {
        return $this->setData(self::BOTTOM_PAGER, $value);
    }

    /**
     * @inheritDoc
     */
    public function getResults(): SearchResultContentInterface
    {
        return $this->getData(self::RESULTS);
    }

    /**
     * @inheritDoc
     */
    public function setResults(SearchResultContentInterface $value)
    {
        return $this->setData(self::RESULTS, $value);
    }

    /**
     * @inheritDoc
     */
    public function getMerchandising(): SearchResultMerchandisingInterface
    {
        return $this->getData(self::MERCHANDISING);
    }

    /**
     * @inheritDoc
     */
    public function setMerchandising(SearchResultMerchandisingInterface $value)
    {
        return $this->setData(self::MERCHANDISING, $value);
    }

    /**
     * @inheritDoc
     */
    public function getSelections(): ?string
    {
        return $this->getData(self::SELECTIONS);
    }

    /**
     * @inheritDoc
     */
    public function setSelections(string $value)
    {
        return $this->setData(self::SELECTIONS, $value);
    }

    /**
     * @inheritDoc
     */
    public function getFacets(): ?string
    {
        return $this->getData(self::FACETS);
    }

    /**
     * @inheritDoc
     */
    public function setFacets(string $value)
    {
        return $this->setData(self::FACETS, $value);
    }

    /**
     * @inheritDoc
     */
    public function getRelated(): ?string
    {
        return $this->getData(self::RELATED);
    }

    /**
     * @inheritDoc
     */
    public function setRelated(string $value)
    {
        return $this->setData(self::RELATED, $value);
    }

    /**
     * @inheritDoc
     */
    public function getFeaturedItems(): SearchResultFeaturedMainInterface
    {
        return $this->getData(self::FEATURED_ITEMS);
    }

    /**
     * @inheritDoc
     */
    public function setFeaturedItems(SearchResultFeaturedMainInterface $value)
    {
        return $this->setData(self::FEATURED_ITEMS, $value);
    }

    /**
     * @inheritDoc
     */
    public function getTabs(): ?string
    {
        return $this->getData(self::TABS);
    }

    /**
     * @inheritDoc
     */
    public function setTabs(string $value)
    {
        return $this->setData(self::TABS, $value);
    }
}
