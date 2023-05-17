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

interface SearchResultContentItemInterface extends ExtensibleDataInterface
{
    /**#@+
     * Constants for keys of data array
     */
    const SCORE = 'Score';
    const ITEM_NAME = 'ItemName';
    const IMAGE_URL = 'ImageURL';
    const ITEM_ID = 'Id';
    const CUSTOM_URL = 'CustomURL';
    const SALE_PRICE = 'SalePrice';
    const IS_ON_SALE = 'IsOnSale';
    const BEST_FRAGMENT = 'BestFragment';
    const SKU = 'SKU';
    const CUSTOM = 'Custom';
    const IS_PINNED = 'IsPinned';
    const HAWK_BOOST = 'HawkBoost';
    /**#@-*/

    /**
     * @return float
     */
    public function getScore() : float;

    /**
     * @param float $value
     * @return $this
     */
    public function setScore(float $value);

    /**
     * @return string|null
     */
    public function getItemName() : ?string;

    /**
     * @param string $value
     * @return $this
     */
    public function setItemName(string $value);

    /**
     * @return string|null
     */
    public function getImageUrl() : ?string;

    /**
     * @param string $value
     * @return $this
     */
    public function setImageUrl(string $value);

    /**
     * @return string|null
     */
    public function getId() : ?string;

    /**
     * @param string $value
     * @return $this
     */
    public function setId(string $value);

    /**
     * @return string|null
     */
    public function getCustomUrl() : ?string;

    /**
     * @param string $value
     * @return $this
     */
    public function setCustomUrl(string $value);

    /**
     * @return float
     */
    public function getSalePrice() : float;

    /**
     * @param float $value
     * @return $this
     */
    public function setSalePrice(float $value);

    /**
     * @return bool
     */
    public function getIsOnSale() : bool;

    /**
     * @param bool $value
     * @return $this
     */
    public function setIsOnSale(bool $value);

    /**
     * @return string|null
     */
    public function getBestFragment() : ?string;

    /**
     * @param string $value
     * @return $this
     */
    public function setBestFragment(string $value);

    /**
     * @return string|null
     */
    public function getSku() : ?string;

    /**
     * @param string $value
     * @return $this
     */
    public function setSku(string $value);

    /**
     * @return string[]
     */
    public function getCustom() : ?array;

    /**
     * @param string[] $value
     * @return $this
     */
    public function setCustom(array $value);

    /**
     * @return bool
     */
    public function getIsPinned() : bool;

    /**
     * @param bool $value
     * @return $this
     */
    public function setIsPinned(bool $value);

    /**
     * @return float
     */
    public function getHawkBoost() : float;

    /**
     * @param float $value
     * @return $this
     */
    public function setHawkBoost(float $value);
}
