<?php
/**
 * Created by PhpStorm.
 * User: astayart
 * Date: 12/28/18
 * Time: 3:37 PM
 */
namespace HawkSearch\Proxy\Plugin;

class Facets
{
    /**
     * @var \HawkSearch\Proxy\Helper\Data
     */
    private $helper;

    public function __construct(\HawkSearch\Proxy\Helper\Data $helper)
    {
        $this->helper = $helper;
    }

    public function beforeGetFacetedData(\HawkSearch\Proxy\Model\ResourceModel\Collection $subject, $field)
    {
        if(!$this->helper->getIsHawkManaged()) {
            $subject->setFlag('use-core-facets', true);
        }
    }
}