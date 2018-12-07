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
    private $labelMap;

    public function __construct(Template\Context $context, \HawkSearch\Proxy\Helper\Data $helper, \HawkSearch\Proxy\Block\BannerFactory $bannerFactory, array $data = [])
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

    public function getTypeLabel($item)
    {
        if(!$this->helper->getShowTypeLabels() || !isset($item->Custom->it)) {
            return '';
        }
        if(!$this->labelMap){
            $this->labelMap = $this->helper->getTypeLabelMap();
        }
        $type = strstr($item->Custom->it, '|^|', true);

        if(!isset($this->labelMap[$type])) {
            preg_match_all('/tab="(.*?)"/', $this->helper->getResultData()->Data->Tabs, $matches);
            if(count($matches) > 0) {
                foreach($matches[1] as $foundType) {
                    if($foundType == 'all' || isset($this->labelMap[$foundType])){
                        continue;
                    }
                    $obj = new \stdClass();
                    $obj->title = ucfirst($foundType);
                    $obj->code = $foundType;
                    $obj->color = sprintf('#%s', substr(md5($foundType), 0, 6));
                    $this->labelMap[$foundType] = $obj;
                }
            }
        }

        $bg = $this->labelMap[$type]->color;
        $label = $this->labelMap[$type]->title;
        $fg = $this->computeForground($bg);
        return sprintf('<p style="background-color: %s; padding: 5px 10px; display:inline-block; font-weight: bold; color: %s">%s</p>', $bg, $fg, $label);
    }
    private function computeForground($rgb) {
        $r = hexdec(substr($rgb, 1, 2));
        $g = hexdec(substr($rgb, 3,2));
        $b = hexdec(substr($rgb, 5, 2));
        if(($r * 299 + $g * 587 + $b * 114) / 1000 < 123) {
            return '#fff';
        }
        return '#000';
    }
}