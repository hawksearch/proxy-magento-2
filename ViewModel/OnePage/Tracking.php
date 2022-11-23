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

use HawkSearch\Connector\Helper\Url as UrlUtility;
use HawkSearch\Connector\Model\Config\ApiSettings;
use HawkSearch\Proxy\Logger\LoggerFactory;
use Magento\Catalog\Model\Session as CatalogSession;
use Magento\Checkout\Model\Session as CheckoutSession;
use Magento\Framework\View\Element\Block\ArgumentInterface;
use Psr\Log\LoggerInterface;

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
     * @var LoggerInterface
     */
    private $logger;

    /**
     * @var UrlUtility
     */
    private $urlUtility;

    /**
     * @var ApiSettings
     */
    private $apiSettingsConfigProvider;

    /**
     * Tracking constructor.
     * @param CheckoutSession $checkoutSession
     * @param CatalogSession $session
     * @param LoggerFactory $loggerFactory
     * @param UrlUtility $urlUtility
     * @param ApiSettings $apiSettingsConfigProvider
     */
    public function __construct(
        CheckoutSession $checkoutSession,
        CatalogSession $session,
        LoggerFactory $loggerFactory,
        UrlUtility $urlUtility,
        ApiSettings $apiSettingsConfigProvider
    ) {
        $this->catalogSession = $session;
        $this->checkoutSession = $checkoutSession;
        $this->logger = $loggerFactory->create();
        $this->urlUtility = $urlUtility;
        $this->apiSettingsConfigProvider = $apiSettingsConfigProvider;
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

        $url = $this->urlUtility->getUriWithPath(
            $this->apiSettingsConfigProvider->getHawkUrl(),
            'sites/_hawk/hawkconversion.aspx'
        )->__toString();

        return $this->urlUtility->getUriWithQuery(
            $url,
            [
                'd' => $this->apiSettingsConfigProvider->getClientGuid(),
                'hawksessionid' => $sid,
                'orderno' => $order->getIncrementId(),
                'total' => $order->getGrandTotal()
            ]
        )->__toString();
    }
}
