<?php
/**
 * Copyright (c) 2013 Hawksearch (www.hawksearch.com) - All Rights Reserved
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

use Magento\Framework\Event\Observer;
use Magento\Framework\Event\ObserverInterface;

class Order implements ObserverInterface
{
    protected $_scopeConfig;

    public function __construct(
        \Magento\Framework\App\Config\ScopeConfigInterface $scopeConfig
    ) {
        $this->_scopeConfig = $scopeConfig;
    }

    public function execute(Observer $observer)
    {
       
   
		$objectManager = \Magento\Framework\App\ObjectManager::getInstance();
		$sess = $objectManager->get('Magento\Catalog\Model\Session');
		$sessionId=$sess->getSessionId();

/** @var Hawksearch/Proxy/Helper/Data $helper */
		$helper = $objectManager->create('HawkSearch\Proxy\Helper\Data');
		/** @var Magento/Sales/Model/Order $order */
		$order = $observer->getOrder();
		$order->getShippingAmount();

		$sess->setData('hawk_tracking_data', $helper->getTrackingPixelUrl(array(
			'd' => $helper->getOrderTackingKey(),
			'hawksessionid' => $sessionId,
			'orderno' => $order->getIncrementId(),
			'total' => $order->getGrandTotal() // or getSubtotal()?
		)));
    
        }
    
}