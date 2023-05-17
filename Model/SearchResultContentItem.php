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

use HawkSearch\Proxy\Api\Data\SearchResultContentItemInterface;
use Magento\Framework\Api\AbstractSimpleObject;

class SearchResultContentItem extends AbstractSimpleObject implements SearchResultContentItemInterface
{
    /**
     * @inheritDoc
     */
    public function getScore(): float
    {
        return (float)$this->_get(self::SCORE);
    }

    /**
     * @inheritDoc
     */
    public function setScore(float $value)
    {
        return $this->setData(self::SCORE, $value);
    }

    /**
     * @inheritDoc
     */
    public function getItemName(): ?string
    {
        return $this->_get(self::ITEM_NAME);
    }

    /**
     * @inheritDoc
     */
    public function setItemName(string $value)
    {
        return $this->setData(self::ITEM_NAME, $value);
    }

    /**
     * @inheritDoc
     */
    public function getImageUrl(): ?string
    {
        return $this->_get(self::IMAGE_URL);
    }

    /**
     * @inheritDoc
     */
    public function setImageUrl(string $value)
    {
        return $this->setData(self::IMAGE_URL, $value);
    }

    /**
     * @inheritDoc
     */
    public function getId(): ?string
    {
        return $this->_get(self::ITEM_ID);
    }

    /**
     * @inheritDoc
     */
    public function setId(string $value)
    {
        return $this->setData(self::ITEM_ID, $value);
    }

    /**
     * @inheritDoc
     */
    public function getCustomUrl(): ?string
    {
        return $this->_get(self::CUSTOM_URL);
    }

    /**
     * @inheritDoc
     */
    public function setCustomUrl(string $value)
    {
        return $this->setData(self::CUSTOM_URL, $value);
    }

    /**
     * @inheritDoc
     */
    public function getSalePrice(): float
    {
        return (float)$this->_get(self::SALE_PRICE);
    }

    /**
     * @inheritDoc
     */
    public function setSalePrice(float $value)
    {
        return $this->setData(self::SALE_PRICE, $value);
    }

    /**
     * @inheritDoc
     */
    public function getIsOnSale(): bool
    {
        return (bool)$this->_get(self::IS_ON_SALE);
    }

    /**
     * @inheritDoc
     */
    public function setIsOnSale(bool $value)
    {
        return $this->setData(self::IS_ON_SALE, $value);
    }

    /**
     * @inheritDoc
     */
    public function getBestFragment(): ?string
    {
        return $this->_get(self::BEST_FRAGMENT);
    }

    /**
     * @inheritDoc
     */
    public function setBestFragment(string $value)
    {
        return $this->setData(self::BEST_FRAGMENT, $value);
    }

    /**
     * @inheritDoc
     */
    public function getSku(): ?string
    {
        return $this->_get(self::SKU);
    }

    /**
     * @inheritDoc
     */
    public function setSku(string $value)
    {
        return $this->setData(self::SKU, $value);
    }

    /**
     * @inheritDoc
     */
    public function getCustom(): array
    {
        return $this->_get(self::CUSTOM) ? (array)$this->_get(self::CUSTOM) : [];
    }

    /**
     * @inheritDoc
     */
    public function setCustom(array $value)
    {
        return $this->setData(self::CUSTOM, $value);
    }

    /**
     * @inheritDoc
     */
    public function getIsPinned(): bool
    {
        return (bool)$this->_get(self::IS_PINNED);
    }

    /**
     * @inheritDoc
     */
    public function setIsPinned(bool $value)
    {
        return $this->setData(self::IS_PINNED, $value);
    }

    /**
     * @inheritDoc
     */
    public function getHawkBoost(): float
    {
        return (float)$this->_get(self::HAWK_BOOST);
    }

    /**
     * @inheritDoc
     */
    public function setHawkBoost(float $value)
    {
        return $this->setData(self::HAWK_BOOST, $value);
    }
}
