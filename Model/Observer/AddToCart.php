<?php


namespace HawkSearch\Proxy\Model\Observer;


use Magento\Framework\Event\Observer;
use Magento\Framework\Event\ObserverInterface;

class AddToCart implements ObserverInterface
{
    /**
     * @var \Magento\Checkout\Model\Session
     */
    private $session;

    public function __construct(\Magento\Checkout\Model\Session $session)
    {
        $this->session = $session;
    }


    /**
     * @param Observer $observer
     * @return void
     */
    public function execute(Observer $observer)
    {
        /*
         * here we need to check that the request was not ajax based, and if so,
         * we need to stick the data in the session and output it on the next
         * page (whatever that may be). we expect the observer to send:
         * ['product' => $product, 'request' => $this->getRequest(), 'response' => $this->getResponse()]
         */
        $request = $observer->getRequest();
        $product = $observer->getProduct();
        $this->session->setHawkTrackAddToCart([
            "add2cart" => [
                "uniqueId" => $product->getSku(),
                "price" => $product->getPrice(),
                "quantity" => $request->getParam("qty"),
                "currency" => $product->getStore()->getCurrentCurrency()->getCurrencyCode()
            ]
        ]);
    }
}