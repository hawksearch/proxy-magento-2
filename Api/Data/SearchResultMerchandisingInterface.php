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

use Magento\Framework\Api\ExtensibleDataInterface;

interface SearchResultMerchandisingInterface extends ExtensibleDataInterface
{
    /**#@+
     * Constants for keys of data array
     */
    const ITEMS = 'Items';
    /**#@-*/

    /**
     * @return \HawkSearch\Proxy\Api\Data\SearchResultBannerInterface[]
     */
    public function getItems() : array;

    /**
     * @param \HawkSearch\Proxy\Api\Data\SearchResultBannerInterface[] $value
     * @return $this
     */
    public function setItems(array $value);
}
