<?php
/**
 * Created by PhpStorm.
 * User: dev
 * Date: 11/16/18
 * Time: 9:55 AM
 */

namespace HawkSearch\Proxy\Block\Track;


class OrderConfirmation extends \Magento\Framework\View\Element\Template
{
    /**
     * @var \HawkSearch\Proxy\Helper\Data
     */
    private $helper;
    /**
     * @var \Magento\Checkout\Model\Session
     */
    private $checkoutSession;
    /**
     * @var \Magento\Catalog\Model\Session
     */
    private $session;

    public function __construct(
        \HawkSearch\Proxy\Helper\Data $helper,
        \Magento\Catalog\Model\Session $session,
        \Magento\Checkout\Model\Session $checkoutSession,
        \Magento\Framework\View\Element\Template\Context $context,
        array $data = [])
    {
        parent::__construct($context, $data);
        $this->helper = $helper;
        $this->checkoutSession = $checkoutSession;
        $this->session = $session;
    }

    public function getTrackingPixelUrl() {
        $sid = $this->session->getHawkSessionId();
        $this->helper->log(sprintf('using hawksessionid = %s, checkout session id = %s', $sid, $this->checkoutSession->getSessionId()));
        $order = $this->checkoutSession->getLastRealOrder();
        return $this->helper->getTrackingPixelUrl([
            'd' => $this->helper->getOrderTackingKey(),
            'hawksessionid' => $sid,
            'orderno' => $order->getIncrementId(),
            'total' => $order->getGrandTotal()
        ]);
    }

    public function getRecsJsonData() {
        $order = $this->checkoutSession->getLastRealOrder();

        return json_encode([
            'sale' => [
                'orderNo' => $order->getIncrementId(),
                'total' => $order->getGrandTotal(),
                'subTotal' => $order->getSubtotal(),
                'tax' => $order->getTaxAmount(),
                'currency' => $order->getOrderCurrency()->getCurrencyCode(),
                'itemList' => $this->getItemList($order)
            ]
        ]);
    }

    private function getItemList(\Magento\Sales\Model\Order $order)
    {
        $itemList = [];
        /** @var \Magento\Sales\Model\Order\Item $item */
        foreach($order->getAllVisibleItems() as $item) {
            $itemList[] = [
                'uniqueid' => $item->getSku(),
                'itemPrice' => $item->getPrice(),
                'quantity' => $item->getQtyOrdered()
            ];
        }
        return $itemList;
    }

    public function isRecsActive() {
        return $this->helper->getRecommendationsActive();
    }
}