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
use Magento\Framework\DataObject;

class SearchResultTemplateItem extends DataObject implements SearchResultTemplateItemInterface
{
    /**
     * @return string|null
     */
    public function getZone(): ?string
    {
        return $this->getData(self::ZONE);
    }

    /**
     * @param string $value
     * @return $this
     */
    public function setZone(string $value)
    {
        return $this->setData(self::ZONE, $value);
    }

    /**
     * @return string|null
     */
    public function getHtml(): ?string
    {
        return $this->getData(self::HTML);
    }

    /**
     * @param string $value
     * @return $this
     */
    public function setHtml(string $value)
    {
        return $this->setData(self::HTML, $value);
    }
}
