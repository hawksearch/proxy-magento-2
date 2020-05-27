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

    public function __construct(
        \HawkSearch\Proxy\Helper\DataFactory $dataFactory,
        \Magento\Framework\Model\Context $context,
        \Magento\Framework\Registry $registry,
        \Magento\Framework\App\Config\ScopeConfigInterface $config,
        \Magento\Framework\App\Cache\TypeListInterface $cacheTypeList,
        \Magento\Framework\Model\ResourceModel\AbstractResource $resource = null,
        \Magento\Framework\Data\Collection\AbstractDb $resourceCollection = null,
        array $data = [],
        Json $serializer = null
    ) {
        parent::__construct(
            $context,
            $registry,
            $config,
            $cacheTypeList,
            $resource,
            $resourceCollection,
            $data,
            $serializer
        );
        $this->dataFactory = $dataFactory;
    }

    protected function _afterLoad()
    {
        parent::_afterLoad();
        if (!$this->getValue() || count($this->getValue()) == 0) {
            /**
             * @var \HawkSearch\Proxy\Helper\Data $helper
             */
            $helper = $this->dataFactory->create();
            $client = new \Zend_Http_Client();
            $client->setUri(
                $helper->getHawkUrl() . '/?'
                . http_build_query(['q' => '', 'hawktabs' => 'json', 'it' => 'all', 'output' => 'custom'])
            );
            $response = $client->request();
            if ($response->getStatus() != 200) {
                return;
            }
            $result = json_decode($response->getBody());
            if (isset($result->Data) && isset($result->Data->Tabs)) {
                $tabs = json_decode($result->Data->Tabs);
                $value = [];
                foreach ($tabs->Tabs as $tab) {
                    if ($tab->Value == 'all') {
                        continue;
                    }
                    $bg = $helper->generateColor($tab->Value);
                    $fg = $helper->generateTextColor($bg);
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
    }
}
