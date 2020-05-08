<?php
/**
 * Created by PhpStorm.
 * User: dev
 * Date: 11/16/18
 * Time: 9:55 AM
 */

namespace HawkSearch\Proxy\Block\OnePage;

class Success extends \Magento\Checkout\Block\Onepage\Success
{
    /**
     * @var \HawkSearch\Proxy\Helper\Data
     */
    private $helper;
    /**
     * @var \Magento\Catalog\Model\Session
     */
    private $session;

    public function __construct(
        \HawkSearch\Proxy\Helper\Data $helper,
        \Magento\Catalog\Model\Session $session,
        \Magento\Framework\View\Element\Template\Context $context,
        \Magento\Checkout\Model\Session $checkoutSession,
        \Magento\Sales\Model\Order\Config $orderConfig,
        \Magento\Framework\App\Http\Context $httpContext,
        array $data = []
    ) {
        parent::__construct($context, $checkoutSession, $orderConfig, $httpContext, $data);
        $this->helper = $helper;
        $this->session = $session;
    }

    public function getTrackingPixelUrl()
    {
        $sid = $this->session->getHawkSessionId();
        $this->helper->log(
            sprintf(
                'using hawksessionid = %s, checkout session id = %s',
                $sid,
                $this->_checkoutSession->getSessionId()
            )
        );
        $order = $this->_checkoutSession->getLastRealOrder();
        return $this->helper->getTrackingPixelUrl(
            [
            'd' => $this->helper->getOrderTackingKey(),
            'hawksessionid' => $sid,
            'orderno' => $order->getIncrementId(),
            'total' => $order->getGrandTotal()
            ]
        );
    }
}
