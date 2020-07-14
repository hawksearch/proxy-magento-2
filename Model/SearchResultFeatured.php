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

use HawkSearch\Proxy\Api\Data\SearchResultTemplateItemInterface;
use HawkSearch\Proxy\Api\Data\SearchResultFeaturedInterface;
use Magento\Framework\DataObject;

class SearchResultFeatured extends DataObject implements SearchResultFeaturedInterface
{
    /**
     * @inheritDoc
     */
    public function getItems(): array
    {
        return $this->getData(self::ITEMS);
    }

    /**
     * @inheritDoc
     */
    public function setItems(array $value)
    {
        return $this->setData(self::ITEMS, $value);
    }
}
