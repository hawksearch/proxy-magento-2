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

namespace HawkSearch\Proxy\Model\Config;

use HawkSearch\Connector\Model\ConfigProvider;
use Magento\Store\Api\Data\StoreInterface;

class Sync extends ConfigProvider
{
    /**#@+
     * Configuration paths
     */
    const CONFIG_ENABLED = 'enabled';
    /**#@-*/

    /**
     * @param StoreInterface|int|null $store
     * @return bool
     */
    public function isEnabled($store = null) : bool
    {
        return !!$this->getConfig(self::CONFIG_ENABLED, $store);
    }
}
