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

namespace HawkSearch\Proxy\Api\Data;

interface SearchResultDataInterface
{
    /**#@+
     * Constants for keys of data array
     */
    const TITLE = 'Title';
    const TOP_TEXT = 'TopText';
    const BREADCRUMB = 'BreadCrumb';
    const TOP_PAGER = 'TopPager';
    const BOTTOM_PAGER = 'BottomPager';
    const RESULTS = 'Results';
    const MERCHANDISING = 'Merchandising';
    const SELECTIONS = 'Selections';
    const FACETS = 'Facets';
    const RELATED = 'Related';
    const FEATURED_ITEMS = 'FeaturedItems';
    const TABS = 'Tabs';
    /**#@-*/

    /**
     * @return string|null
     */
    public function getTitle() : ?string;

    /**
     * @param string $value
     * @return $this
     */
    public function setTitle(string $value);

    /**
     * @return string|null
     */
    public function getTopText() : ?string;

    /**
     * @param string $value
     * @return $this
     */
    public function setTopText(string $value);

    /**
     * @return string|null
     */
    public function getBreadCrumb() : ?string;

    /**
     * @param string $value
     * @return $this
     */
    public function setBreadCrumb(string $value);

    /**
     * @return string|null
     */
    public function getTopPager() : ?string;

    /**
     * @param string $value
     * @return $this
     */
    public function setTopPager(string $value);

    /**
     * @return string|null
     */
    public function getBottomPager() : ?string;

    /**
     * @param string $value
     * @return $this
     */
    public function setBottomPager(string $value);

    /**
     * @return SearchResultContentInterface
     */
    public function getResults() : SearchResultContentInterface;

    /**
     * @param SearchResultContentInterface $value
     * @return $this
     */
    public function setResults(SearchResultContentInterface $value);

    /**
     * @return SearchResultMerchandisingInterface
     */
    public function getMerchandising() : SearchResultMerchandisingInterface;

    /**
     * @param SearchResultMerchandisingInterface $value
     * @return $this
     */
    public function setMerchandising(SearchResultMerchandisingInterface $value);

    /**
     * @return string|null
     */
    public function getSelections() : ?string;

    /**
     * @param string $value
     * @return $this
     */
    public function setSelections(string $value);

    /**
     * @return string|null
     */
    public function getFacets() : ?string;

    /**
     * @param string $value
     * @return $this
     */
    public function setFacets(string $value);

    /**
     * @return string|null
     */
    public function getRelated() : ?string;

    /**
     * @param string $value
     * @return $this
     */
    public function setRelated(string $value);

    /**
     * @return SearchResultFeaturedMainInterface
     */
    public function getFeaturedItems() : SearchResultFeaturedMainInterface;

    /**
     * @param SearchResultFeaturedMainInterface $value
     * @return $this
     */
    public function setFeaturedItems(SearchResultFeaturedMainInterface $value);

    /**
     * @return string|null
     */
    public function getTabs() : ?string;

    /**
     * @param string $value
     * @return $this
     */
    public function setTabs(string $value);
}
