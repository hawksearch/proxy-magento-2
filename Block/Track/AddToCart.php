<?php

namespace HawkSearch\Proxy\Block\Track;

use Magento\Framework\View\Element\Template;

class AddToCart extends \Magento\Framework\View\Element\Template
{
    /**
     * @var \Magento\Checkout\Model\Session
     */
    private $session;

    public function __construct(\Magento\Checkout\Model\Session $session,
                                Template\Context $context,
                                array $data = [])
    {
        parent::__construct($context, $data);
        $this->session = $session;
    }

    public function getAddToCartJsonData()
    {
        $data = $this->session->getHawkTrackAddToCart();
        $this->session->unsHawkTrackAddToCart();
        return empty($data) ? false : json_encode($data);
    }
}