<?php

namespace HawkSearch\Proxy\Plugin;

class GetFacetedData
{
    private $helper; 
    
    public function __construct(\HawkSearch\Proxy\Helper\Data $helper)
    {
        $this->helper = $helper;
    }

    public function aroundGetFacetedData($subject, $proceed, $field) {
        if($this->helper->getIsHawkManaged()){
            return;
        }
        return $proceed($field);
    }
}