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

namespace HawkSearch\Proxy\Api\Data;

use Magento\Framework\Api\ExtensibleDataInterface;

interface SearchResultResponseInterface extends ExtensibleDataInterface
{
    /**#@+
     * Constants for keys of data array
     */
    const SUCCESS = 'Success';
    const RESPONSE_DATA = 'ResponseData';
    const LOCATION = 'Location';
    const DID_YOU_MEAN = 'DidYouMean';
    const TRACKING_ID = 'TrackingId';
    const META_ROBOTS = 'MetaRobots';
    const HEADER_TITLE = 'HeaderTitle';
    const META_DESCRIPTION = 'MetaDescription';
    const META_KEYWORDS = 'MetaKeywords';
    const REL_CANONICAL = 'RelCanonical';
    const ORIGINAL = 'Original';
    const KEYWORD = 'Keyword';
    const PAGE_LAYOUT_ID = 'PageLayoutId';
    const SEARCH_DURATION = 'SearchDuration';
    const QUERY_USED_ALL_KEYWORDS = 'QueryUsedAllKeywords';
    /**#@-*/

    /**
     * @return bool
     */
    public function getSuccess(): bool;

    /**
     * @param bool $value
     * @return $this
     */
    public function setSuccess(bool $value);

    /**
     * @return \HawkSearch\Proxy\Api\Data\SearchResultDataInterface
     */
    public function getResponseData(): \HawkSearch\Proxy\Api\Data\SearchResultDataInterface;

    /**
     * @param \HawkSearch\Proxy\Api\Data\SearchResultDataInterface|null $value
     * @return $this
     */
    public function setResponseData(?\HawkSearch\Proxy\Api\Data\SearchResultDataInterface $value);

    /**
     * @return string
     */
    public function getLocation(): string;

    /**
     * @param string|null $value
     * @return $this
     */
    public function setLocation(?string $value);

    /**
     * @return string
     */
    public function getDidYouMean(): string;

    /**
     * @param string|null $value
     * @return $this
     */
    public function setDidYouMean(?string $value);

    /**
     * @return string
     */
    public function getTrackingId(): string;

    /**
     * @param string|null $value
     * @return $this
     */
    public function setTrackingId(?string $value);

    /**
     * @return string
     */
    public function getMetaRobots(): string;

    /**
     * @param string|null $value
     * @return $this
     */
    public function setMetaRobots(?string $value);

    /**
     * @return string
     */
    public function getHeaderTitle(): string;

    /**
     * @param string|null $value
     * @return $this
     */
    public function setHeaderTitle(?string $value);

    /**
     * @return string
     */
    public function getMetaDescription(): string;

    /**
     * @param string|null $value
     * @return $this
     */
    public function setMetaDescription(?string $value);

    /**
     * @return string
     */
    public function getMetaKeywords(): string;

    /**
     * @param string|null $value
     * @return $this
     */
    public function setMetaKeywords(?string $value);

    /**
     * @return string
     */
    public function getRelCanonical(): string;

    /**
     * @param string|null $value
     * @return $this
     */
    public function setRelCanonical(?string $value);

    /**
     * @return string
     */
    public function getOriginal(): string;

    /**
     * @param string|null $value
     * @return $this
     */
    public function setOriginal(?string $value);

    /**
     * @return string
     */
    public function getKeyword(): string;

    /**
     * @param string|null $value
     * @return $this
     */
    public function setKeyword(?string $value);

    /**
     * @return int
     */
    public function getPageLayoutId(): int;

    /**
     * @param int $value
     * @return $this
     */
    public function setPageLayoutId(int $value);

    /**
     * @return int
     */
    public function getSearchDuration(): int;

    /**
     * @param int $value
     * @return $this
     */
    public function setSearchDuration(int $value);

    /**
     * @return bool
     */
    public function getQueryUsedAllKeywords(): bool;

    /**
     * @param bool $value
     * @return $this
     */
    public function setQueryUsedAllKeywords(bool $value);
}
