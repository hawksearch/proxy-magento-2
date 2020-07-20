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
     * @inheritDoc
     */
    public function getSuccess(): bool
    {
        return $this->getData(self::SUCCESS);
    }

    /**
     * @inheritDoc
     */
    public function setSuccess(bool $value)
    {
        return $this->setData(self::SUCCESS, $value);
    }

    /**
     * @inheritDoc
     */
    public function getResponseData(): SearchResultDataInterface
    {
        return $this->getData(self::RESPONSE_DATA);
    }

    /**
     * @inheritDoc
     */
    public function setResponseData(SearchResultDataInterface $value)
    {
        return $this->setData(self::RESPONSE_DATA, $value);
    }

    /**
     * @inheritDoc
     */
    public function getLocation(): ?string
    {
        return $this->getData(self::LOCATION);
    }

    /**
     * @inheritDoc
     */
    public function setLocation(string $value)
    {
        return $this->setData(self::LOCATION, $value);
    }

    /**
     * @inheritDoc
     */
    public function getDidYouMean(): ?string
    {
        return $this->getData(self::DID_YOU_MEAN);
    }

    /**
     * @inheritDoc
     */
    public function setDidYouMean(string $value)
    {
        return $this->setData(self::DID_YOU_MEAN, $value);
    }

    /**
     * @inheritDoc
     */
    public function getTrackingId(): ?string
    {
        return $this->getData(self::TRACKING_ID);
    }

    /**
     * @inheritDoc
     */
    public function setTrackingId(string $value)
    {
        return $this->setData(self::TRACKING_ID, $value);
    }

    /**
     * @inheritDoc
     */
    public function getMetaRobots(): ?string
    {
        return $this->getData(self::META_ROBOTS);
    }

    /**
     * @inheritDoc
     */
    public function setMetaRobots(string $value)
    {
        return $this->setData(self::META_ROBOTS, $value);
    }

    /**
     * @inheritDoc
     */
    public function getHeaderTitle(): ?string
    {
        return $this->getData(self::HEADER_TITLE);
    }

    /**
     * @inheritDoc
     */
    public function setHeaderTitle(string $value)
    {
        return $this->setData(self::HEADER_TITLE, $value);
    }

    /**
     * @inheritDoc
     */
    public function getMetaDescription(): ?string
    {
        return $this->getData(self::META_DESCRIPTION);
    }

    /**
     * @inheritDoc
     */
    public function setMetaDescription(string $value)
    {
        return $this->setData(self::META_DESCRIPTION, $value);
    }

    /**
     * @inheritDoc
     */
    public function getMetaKeywords(): ?string
    {
        return $this->getData(self::META_KEYWORDS);
    }

    /**
     * @inheritDoc
     */
    public function setMetaKeywords(string $value)
    {
        return $this->setData(self::META_KEYWORDS, $value);
    }

    /**
     * @inheritDoc
     */
    public function getRelCanonical(): ?string
    {
        return $this->getData(self::REL_CANONICAL);
    }

    /**
     * @inheritDoc
     */
    public function setRelCanonical(string $value)
    {
        return $this->setData(self::REL_CANONICAL, $value);
    }

    /**
     * @inheritDoc
     */
    public function getOriginal(): ?string
    {
        return $this->getData(self::ORIGINAL);
    }

    /**
     * @inheritDoc
     */
    public function setOriginal(string $value)
    {
        return $this->setData(self::ORIGINAL, $value);
    }

    /**
     * @inheritDoc
     */
    public function getKeyword(): ?string
    {
        return $this->getData(self::KEYWORD);
    }

    /**
     * @inheritDoc
     */
    public function setKeyword(string $value)
    {
        return $this->setData(self::KEYWORD, $value);
    }

    /**
     * @inheritDoc
     */
    public function getPageLayoutId(): int
    {
        return $this->getData(self::PAGE_LAYOUT_ID);
    }

    /**
     * @inheritDoc
     */
    public function setPageLayoutId(int $value)
    {
        return $this->setData(self::PAGE_LAYOUT_ID, $value);
    }

    /**
     * @inheritDoc
     */
    public function getSearchDuration(): int
    {
        return $this->getData(self::SEARCH_DURATION);
    }

    /**
     * @inheritDoc
     */
    public function setSearchDuration(int $value)
    {
        return $this->setData(self::SEARCH_DURATION, $value);
    }

    /**
     * @inheritDoc
     */
    public function getQueryUsedAllKeywords(): bool
    {
        return $this->getData(self::QUERY_USED_ALL_KEYWORDS);
    }

    /**
     * @inheritDoc
     */
    public function setQueryUsedAllKeywords(bool $value)
    {
        return $this->setData(self::QUERY_USED_ALL_KEYWORDS, $value);
    }
}
