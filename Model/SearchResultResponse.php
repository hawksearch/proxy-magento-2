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

use HawkSearch\Proxy\Api\Data\SearchResultDataInterface;
use HawkSearch\Proxy\Api\Data\SearchResultResponseInterface;
use Magento\Framework\DataObject;

class SearchResultResponse extends DataObject implements SearchResultResponseInterface
{
    /**
     * @return bool
     */
    public function getSuccess(): bool
    {
        return $this->getData(self::SUCCESS);
    }

    /**
     * @param bool $value
     * @return $this
     */
    public function setSuccess(bool $value)
    {
        return $this->setData(self::SUCCESS, $value);
    }

    /**
     * @return SearchResultDataInterface
     */
    public function getResponseData(): SearchResultDataInterface
    {
        return $this->getData(self::RESPONSE_DATA);
    }

    /**
     * @param SearchResultDataInterface $value
     * @return $this
     */
    public function setResponseData(SearchResultDataInterface $value)
    {
        return $this->setData(self::RESPONSE_DATA, $value);
    }

    /**
     * @return string|null
     */
    public function getLocation(): ?string
    {
        return $this->getData(self::LOCATION);
    }

    /**
     * @param string $value
     * @return $this
     */
    public function setLocation(string $value)
    {
        return $this->setData(self::LOCATION, $value);
    }

    /**
     * @return string|null
     */
    public function getDidYouMean(): ?string
    {
        return $this->getData(self::DID_YOU_MEAN);
    }

    /**
     * @param string $value
     * @return $this
     */
    public function setDidYouMean(string $value)
    {
        return $this->setData(self::DID_YOU_MEAN, $value);
    }

    /**
     * @return string|null
     */
    public function getTrackingId(): ?string
    {
        return $this->getData(self::TRACKING_ID);
    }

    /**
     * @param string $value
     * @return $this
     */
    public function setTrackingId(string $value)
    {
        return $this->setData(self::TRACKING_ID, $value);
    }

    /**
     * @return string|null
     */
    public function getMetaRobots(): ?string
    {
        return $this->getData(self::META_ROBOTS);
    }

    /**
     * @param string $value
     * @return $this
     */
    public function setMetaRobots(string $value)
    {
        return $this->setData(self::META_ROBOTS, $value);
    }

    /**
     * @return string|null
     */
    public function getHeaderTitle(): ?string
    {
        return $this->getData(self::HEADER_TITLE);
    }

    /**
     * @param string $value
     * @return $this
     */
    public function setHeaderTitle(string $value)
    {
        return $this->setData(self::HEADER_TITLE, $value);
    }

    /**
     * @return string|null
     */
    public function getMetaDescription(): ?string
    {
        return $this->getData(self::META_DESCRIPTION);
    }

    /**
     * @param string $value
     * @return $this
     */
    public function setMetaDescription(string $value)
    {
        return $this->setData(self::META_DESCRIPTION, $value);
    }

    /**
     * @return string|null
     */
    public function getMetaKeywords(): ?string
    {
        return $this->getData(self::META_KEYWORDS);
    }

    /**
     * @param string $value
     * @return $this
     */
    public function setMetaKeywords(string $value)
    {
        return $this->setData(self::META_KEYWORDS, $value);
    }

    /**
     * @return string|null
     */
    public function getRelCanonical(): ?string
    {
        return $this->getData(self::REL_CANONICAL);
    }

    /**
     * @param string $value
     * @return $this
     */
    public function setRelCanonical(string $value)
    {
        return $this->setData(self::REL_CANONICAL, $value);
    }

    /**
     * @return string|null
     */
    public function getKeyword(): ?string
    {
        return $this->getData(self::KEYWORD);
    }

    /**
     * @param string $value
     * @return $this
     */
    public function setKeyword(string $value)
    {
        return $this->setData(self::KEYWORD, $value);
    }

    /**
     * @return int
     */
    public function getPageLayoutId(): int
    {
        return $this->getData(self::PAGE_LAYOUT_ID);
    }

    /**
     * @param int $value
     * @return $this
     */
    public function setPageLayoutId(int $value)
    {
        return $this->setData(self::PAGE_LAYOUT_ID, $value);
    }

    /**
     * @return int
     */
    public function getSearchDuration(): int
    {
        return $this->getData(self::SEARCH_DURATION);
    }

    /**
     * @param int $value
     * @return $this
     */
    public function setSearchDuration(int $value)
    {
        return $this->setData(self::SEARCH_DURATION, $value);
    }

    /**
     * @return bool
     */
    public function getQueryUsedAllKeywords(): bool
    {
        return $this->getData(self::QUERY_USED_ALL_KEYWORDS);
    }

    /**
     * @param bool $value
     * @return $this
     */
    public function setQueryUsedAllKeywords(bool $value)
    {
        return $this->setData(self::QUERY_USED_ALL_KEYWORDS, $value);
    }
}
