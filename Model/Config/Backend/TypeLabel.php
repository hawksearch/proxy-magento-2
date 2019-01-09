<?php
/**
 * Created by PhpStorm.
 * User: dev
 * Date: 12/7/18
 * Time: 8:15 AM
 */

namespace HawkSearch\Proxy\Model\Config\Backend;


use Magento\Framework\Serialize\Serializer\Json;

class TypeLabel extends \Magento\Config\Model\Config\Backend\Serialized\ArraySerialized
{
    /**
     * @var \HawkSearch\Proxy\Helper\DataFactory
     */
    private $dataFactory;

    public function __construct(\HawkSearch\Proxy\Helper\DataFactory $dataFactory,
                                \Magento\Framework\Model\Context $context,
                                \Magento\Framework\Registry $registry,
                                \Magento\Framework\App\Config\ScopeConfigInterface $config,
                                \Magento\Framework\App\Cache\TypeListInterface $cacheTypeList,
                                \Magento\Framework\Model\ResourceModel\AbstractResource $resource = null,
                                \Magento\Framework\Data\Collection\AbstractDb $resourceCollection = null,
                                array $data = [],
                                Json $serializer = null)
    {
        parent::__construct($context, $registry, $config, $cacheTypeList, $resource, $resourceCollection, $data, $serializer);
        $this->dataFactory = $dataFactory;
    }

    protected function _afterLoad()
    {
        parent::_afterLoad();
        if(count($this->getValue()) == 0) {
            /** @var \HawkSearch\Proxy\Helper\Data $helper */
            $helper = $this->dataFactory->create();
            $client = new \Zend_Http_Client();
            $client->setUri($helper->getTrackingUrl() . '/?' . http_build_query(['q' => '', 'hawktabs' => 'json', 'it' => 'all', 'output' => 'custom']));
            $response = $client->request();
            $result = json_decode($response->getBody());
            $tabs = json_decode($result->Data->Tabs);
            $value = [];
            foreach ($tabs->Tabs as $tab) {
                if($tab->Value == 'all') {
                    continue;
                }
                $bg = $this->generateColor($tab->Value);
                $fg = $this->generateTextColor($bg);
                $value['_' . $tab->Value] = [
                    'title' => $tab->Title,
                    'code' => $tab->Value,
                    'color' => $bg,
                    'textColor' => $fg
                ];
            }
            $this->setValue($value);
        }
    }

    private function generateColor($value)
    {
        return sprintf('#%s', substr(md5($value), 0, 6));
    }

    private function generateTextColor($rgb)
    {
        $r = hexdec(substr($rgb, 1, 2));
        $g = hexdec(substr($rgb, 3,2));
        $b = hexdec(substr($rgb, 5, 2));
        if(($r * 299 + $g * 587 + $b * 114) / 1000 < 123) {
            return '#fff';
        }
        return '#000';
    }

}