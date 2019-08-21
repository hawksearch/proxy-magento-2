<?php

namespace HawkSearch\Proxy\Block\Track;


use Magento\Framework\View\Element\Template;

class ProductView extends \Magento\Framework\View\Element\Template
{
    /**
     * @var \Magento\Framework\Registry
     */
    private $coreRegistry;

    public function __construct(
        \Magento\Framework\Registry $coreRegistry,
        Template\Context $context, array $data = []
    )
    {
        parent::__construct($context, $data);
        $this->coreRegistry = $coreRegistry;
    }

    public function getRecsPageloadJsonData()
    {
        return json_encode([
            'pageload' => [
                'context' => [
                    'uniqueid' => $this->getCurrentProductSku()
                ],
                'pageType' => 'item'
            ]
        ]);
    }

    private function getCurrentProductSku()
    {
        $product = $this->coreRegistry->registry('current_product');
        return $product->getSku();
    }
}