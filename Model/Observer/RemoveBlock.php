<?php
/**
 * Copyright (c) 2020 Hawksearch (www.hawksearch.com) - All Rights Reserved
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
 * IN THE SOFTWARE.
 */
namespace HawkSearch\Proxy\Model\Observer;

use Magento\Framework\App\Config\ScopeConfigInterface;
use Magento\Framework\Event\Observer;
use Magento\Framework\Event\ObserverInterface;

class RemoveBlock implements ObserverInterface
{
    protected $_scopeConfig;

    public function __construct(ScopeConfigInterface $scopeConfig)
    {
        $this->_scopeConfig = $scopeConfig;
    }

    public function execute(Observer $observer)
    {
        /**
         * @var \Magento\Framework\View\Element\Template $block
         */
        $block = $observer->getBlock();

        if ($block->getType() == Magento\Catalog\Block\Product\ListProduct::class
            || $block->getType() == Magento\Catalog\Block\Product\ProductList\Toolbar::class
            || $block->getType() == Magento\Theme\Block\Html\Pager::class
        ) {
            $block->setTemplate(false);
        }
    }
}
