<?php
/**
 * Created by PhpStorm.
 * User: dev
 * Date: 9/7/18
 * Time: 8:50 AM
 */

namespace HawkSearch\Proxy\Block;

use Magento\Framework\View\Element\Template;

class Tabbed extends Html
{
    /**
     * @var \HawkSearch\Proxy\Helper\Data
     */
    private $helper;

    public function __construct(Template\Context $context, \HawkSearch\Proxy\Helper\Data $helper, \HawkSearch\Proxy\Banner\BannerFactory $bannerFactory, array $data = [])
    {
        parent::__construct($context, $helper, $bannerFactory, $data);
        $this->helper = $helper;
    }

    public function getTabs()
    {
        $resultData = $this->helper->getResultData()->Data;
        if(property_exists($resultData, 'Tabs')){
            return $resultData->Tabs;
        }
        return null;
    }
    public function getContent()
    {
        $data = $this->helper->getResultData()->Data;
        $results = json_decode($data->Results);
        return $results->Items;
    }

}