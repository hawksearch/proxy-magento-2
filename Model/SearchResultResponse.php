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

use HawkSearch\Proxy\Api\Data\SearchResultDataInterfaceFactory;
use HawkSearch\Proxy\Api\Data\SearchResultDataInterface;
use HawkSearch\Proxy\Api\Data\SearchResultResponseInterface;
use Magento\Framework\Api\AbstractSimpleObject;

class SearchResultResponse extends AbstractSimpleObject implements SearchResultResponseInterface
{
    /**
     * @var SearchResultDataInterfaceFactory
     */
    private $searchResultDataInterfaceFactory;

    /**
     * SearchResultResponse constructor.
     * @param SearchResultDataInterfaceFactory $searchResultDataInterfaceFactory
     */
    public function __construct(
        SearchResultDataInterfaceFactory $searchResultDataInterfaceFactory
    ) {
        $this->searchResultDataInterfaceFactory = $searchResultDataInterfaceFactory;
    }

    /**
     * @inheritDoc
     */
    public function getSuccess(): bool
    {
        return !!$this->_get(self::SUCCESS);
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
        $result = $this->_get(self::RESPONSE_DATA);
        if ($result === null) {
            $result = $this->searchResultDataInterfaceFactory->create();
        }
        return $result;
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
        return $this->_get(self::LOCATION);
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
        return $this->_get(self::DID_YOU_MEAN);
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
        return $this->_get(self::TRACKING_ID);
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
        return $this->_get(self::META_ROBOTS);
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
        return $this->_get(self::HEADER_TITLE);
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
        return $this->_get(self::META_DESCRIPTION);
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
        return $this->_get(self::META_KEYWORDS);
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
        return $this->_get(self::REL_CANONICAL);
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
        return $this->_get(self::ORIGINAL);
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
        return $this->_get(self::KEYWORD);
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
        return (int)$this->_get(self::PAGE_LAYOUT_ID);
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
        return (int)$this->_get(self::SEARCH_DURATION);
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
        return !!$this->_get(self::QUERY_USED_ALL_KEYWORDS);
    }

    /**
     * @inheritDoc
     */
    public function setQueryUsedAllKeywords(bool $value)
    {
        return $this->setData(self::QUERY_USED_ALL_KEYWORDS, $value);
    }
}
