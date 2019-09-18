<?php

namespace HawkSearch\Proxy\Block\Track;


use Magento\Framework\View\Element\Template;

class CmsPageView extends \Magento\Framework\View\Element\Template
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

    public function getTrackPageloadJsonData()
    {
        return json_encode([
            'pageload' => [
                'pageType' => 'custom'
            ]
        ]);
    }
}