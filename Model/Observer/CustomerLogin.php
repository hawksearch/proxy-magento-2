<?php

namespace HawkSearch\Proxy\Model\Observer;

use Magento\Framework\Event\Observer;
use Magento\Framework\Event\ObserverInterface;

class CustomerLogin implements ObserverInterface
{
    /**
     * @var \Magento\Framework\Stdlib\CookieManagerInterface
     */
    private $cookieManager;
    /**
     * @var \HawkSearch\Proxy\Helper\Data
     */
    private $helper;

    /**
     * CustomerLogin constructor.
     * @param \Magento\Framework\Stdlib\CookieManagerInterface $cookieManager
     * @param \HawkSearch\Proxy\Helper\Data $helper
     */
    public function __construct(
        \Magento\Framework\Stdlib\CookieManagerInterface $cookieManager,
        \HawkSearch\Proxy\Helper\Data $helper
    )
    {
        $this->cookieManager = $cookieManager;
        $this->helper = $helper;
    }

    /**
     * @param Observer $observer
     * @return void
     */
    public function execute(Observer $observer)
    {
        $api = implode("/", [rtrim($this->helper->getTrackingUrl(), "/"), "api/identify"]);
        $api = str_replace("http://", "https://", $api);
        $visitId = $this->cookieManager->getCookie("visit_id");
        $visitorId = $this->cookieManager->getCookie("visitor_id");
        $userId = $observer->getCustomer()->getId();
        try {
            $client = new \Zend_Http_Client();
            $client->setConfig(['timeout' => 60]);

            $client->setUri($api);
            $client->setMethod(\Zend\Http\Request::METHOD_PUT);
            $client->setRawData(json_encode(['userId' => $userId, 'visitId' => $visitId, 'visitorId' => $visitorId]), 'application/json');
            $client->setHeaders('X-HawkSearch-ApiKey', $this->helper->getApiKey());
            $client->setHeaders('Accept', 'application/json');
            $this->helper->log(sprintf('fetching request. URL: %s, Method: %s', $api, \Zend\Http\Request::METHOD_PUT));
            $response = $client->request();
            $this->helper->log(sprintf("Customer loging result: %s", $response->getRawBody()));
        } catch (\Exception $e) {
            $this->helper->log($e->getMessage());
        }
    }
}