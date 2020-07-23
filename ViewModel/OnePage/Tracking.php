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

namespace HawkSearch\Proxy\ViewModel\OnePage;

use HawkSearch\Proxy\Logger\ProxyLogger;
use HawkSearch\Proxy\Model\ConfigProvider;
use Magento\Catalog\Model\Session as CatalogSession;
use Magento\Checkout\Model\Session as CheckoutSession;
use Magento\Framework\View\Element\Block\ArgumentInterface;

class Tracking implements ArgumentInterface
{
    /**
     * @var CatalogSession
     */
    private $catalogSession;

    /**
     * @var CheckoutSession
     */
    private $checkoutSession;

    /**
     * @var ConfigProvider
     */
    private $configProvider;

    /**
     * @var ProxyLogger
     */
    private $logger;

    /**
     * Tracking constructor.
     * @param CheckoutSession $checkoutSession
     * @param CatalogSession $session
     * @param ConfigProvider $configProvider
     * @param ProxyLogger $logger
     */
    public function __construct(
        CheckoutSession $checkoutSession,
        CatalogSession $session,
        ConfigProvider $configProvider,
        ProxyLogger $logger
    ) {
        $this->catalogSession = $session;
        $this->checkoutSession = $checkoutSession;
        $this->configProvider = $configProvider;
        $this->logger = $logger;
    }

    /**
     * @return string
     */
    public function getTrackingPixelUrl()
    {
        $sid = $this->catalogSession->getSessionId();
        $this->logger->debug(
            sprintf(
                'using hawksessionid = %s, checkout session id = %s',
                $sid,
                $this->checkoutSession->getSessionId()
            )
        );
        $order = $this->checkoutSession->getLastRealOrder();
        return $this->configProvider->getTrackingPixelUrl() . http_build_query(
            [
                'd' => $this->configProvider->getOrderTrackingKey(),
                'hawksessionid' => $sid,
                'orderno' => $order->getIncrementId(),
                'total' => $order->getGrandTotal()
            ]
        );
    }
}
