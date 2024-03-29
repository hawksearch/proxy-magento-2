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

use HawkSearch\Proxy\Api\Data\SearchResultBannerInterface;
use Magento\Framework\Api\AbstractSimpleObject;

class SearchResultBanner extends AbstractSimpleObject implements SearchResultBannerInterface
{
    /**
     * @inheritDoc
     */
    public function getZone(): ?string
    {
        return $this->_get(self::ZONE);
    }

    /**
     * @inheritDoc
     */
    public function setZone(string $value)
    {
        return $this->setData(self::ZONE, $value);
    }

    /**
     * @inheritDoc
     */
    public function getHtml(): ?string
    {
        return $this->_get(self::HTML);
    }

    /**
     * @inheritDoc
     */
    public function setHtml(string $value)
    {
        return $this->setData(self::HTML, $value);
    }

    /**
     * @inheritDoc
     */
    public function getTitle(): ?string
    {
        return $this->_get(self::TITLE);
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
    public function getItems(): array
    {
        return $this->_get(self::ITEMS) ?? [];
    }

    /**
     * @inheritDoc
     */
    public function setItems(array $value)
    {
        return $this->setData(self::ITEMS, $value);
    }
}
