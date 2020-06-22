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
     * @return string|null
     */
    public function getTitle(): ?string
    {
        return $this->getData(self::TITLE);
    }

    /**
     * @param string $value
     * @return $this
     */
    public function setTitle(string $value)
    {
        return $this->setData(self::TITLE, $value);
    }

    /**
     * @return string|null
     */
    public function getTopText(): ?string
    {
        return $this->getData(self::TOP_TEXT);
    }

    /**
     * @param string $value
     * @return $this
     */
    public function setTopText(string $value)
    {
        return $this->setData(self::TOP_TEXT, $value);
    }

    /**
     * @return string|null
     */
    public function getBreadCrumb(): ?string
    {
        return $this->getData(self::BREADCRUMB);
    }

    /**
     * @param string $value
     * @return $this
     */
    public function setBreadCrumb(string $value)
    {
        return $this->setData(self::BREADCRUMB, $value);
    }

    /**
     * @return string|null
     */
    public function getTopPager(): ?string
    {
        return $this->getData(self::TOP_PAGER);
    }

    /**
     * @param string $value
     * @return $this
     */
    public function setTopPager(string $value)
    {
        return $this->setData(self::TOP_PAGER, $value);
    }

    /**
     * @return string|null
     */
    public function getBottomPager(): ?string
    {
        return $this->getData(self::BOTTOM_PAGER);
    }

    /**
     * @param string $value
     * @return $this
     */
    public function setBottomPager(string $value)
    {
        return $this->setData(self::BOTTOM_PAGER, $value);
    }

    /**
     * @return SearchResultContentInterface
     */
    public function getResults(): SearchResultContentInterface
    {
        return $this->getData(self::RESULTS);
    }

    /**
     * @param SearchResultContentInterface $value
     * @return $this
     */
    public function setResults(SearchResultContentInterface $value)
    {
        return $this->setData(self::RESULTS, $value);
    }

    /**
     * @return SearchResultMerchandisingInterface
     */
    public function getMerchandising(): SearchResultMerchandisingInterface
    {
        return $this->getData(self::MERCHANDISING);
    }

    /**
     * @param SearchResultMerchandisingInterface $value
     * @return $this
     */
    public function setMerchandising(SearchResultMerchandisingInterface $value)
    {
        return $this->setData(self::MERCHANDISING, $value);
    }

    /**
     * @return string|null
     */
    public function getSelections(): ?string
    {
        return $this->getData(self::SELECTIONS);
    }

    /**
     * @param string $value
     * @return $this
     */
    public function setSelections(string $value)
    {
        return $this->setData(self::SELECTIONS, $value);
    }

    /**
     * @return string|null
     */
    public function getFacets(): ?string
    {
        return $this->getData(self::FACETS);
    }

    /**
     * @param string $value
     * @return $this
     */
    public function setFacets(string $value)
    {
        return $this->setData(self::FACETS, $value);
    }

    /**
     * @return string|null
     */
    public function getRelated(): ?string
    {
        return $this->getData(self::RELATED);
    }

    /**
     * @param string $value
     * @return $this
     */
    public function setRelated(string $value)
    {
        return $this->setData(self::RELATED, $value);
    }

    /**
     * @return SearchResultFeaturedMainInterface
     */
    public function getFeaturedItems(): SearchResultFeaturedMainInterface
    {
        return $this->getData(self::FEATURED_ITEMS);
    }

    /**
     * @param SearchResultFeaturedMainInterface $value
     * @return $this
     */
    public function setFeaturedItems(SearchResultFeaturedMainInterface $value)
    {
        return $this->setData(self::FEATURED_ITEMS, $value);
    }

    /**
     * @return string|null
     */
    public function getTabs(): ?string
    {
        return $this->getData(self::TABS);
    }

    /**
     * @param string $value
     * @return $this
     */
    public function setTabs(string $value)
    {
        return $this->setData(self::TABS, $value);
    }
}
