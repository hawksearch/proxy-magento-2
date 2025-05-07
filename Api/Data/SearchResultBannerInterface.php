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

interface SearchResultBannerInterface extends ExtensibleDataInterface
{
    /**#@+
     * Constants for keys of data array
     */
    const ZONE = 'Zone';
    const HTML = 'Html';
    const TITLE = 'Title';
    const ITEMS = 'Items';
    /**#@-*/

    /**
     * @return string
     */
    public function getZone(): string;

    /**
     * @param string|null $value
     * @return $this
     */
    public function setZone(?string $value);

    /**
     * @return string
     */
    public function getHtml(): string;

    /**
     * @param string|null $value
     * @return $this
     */
    public function setHtml(?string $value);

    /**
     * @return string
     */
    public function getTitle(): string;

    /**
     * @param string|null $value
     * @return $this
     */
    public function setTitle(?string $value);

    /**
     * @return \HawkSearch\Proxy\Api\Data\SearchResultContentItemInterface[]
     */
    public function getItems(): array;

    /**
     * @param \HawkSearch\Proxy\Api\Data\SearchResultContentItemInterface[]|null $value
     * @return $this
     */
    public function setItems(?array $value);
}
